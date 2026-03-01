import { Request, Response, NextFunction } from "express";
import { uploadToSupabase, deleteFromSupabase } from "../utils/drive";
import MedicalRecord from "../models/medicalRecord.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import path from "path";
import { supabase } from "../configs/supabaseClient";
import Appointment from "../models/appointment.model";

export const uploadMedicalRecords = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { appointmentId } = req.body;
    if (!appointmentId) return next(new AppError("Missing appointmentId", 400));

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0)
      return next(new AppError("No files uploaded", 400));

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}-${file.originalname}`;

        const { data, error } = await supabase.storage
          .from("medical-records")
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (error)
          throw new AppError(
            `Upload failed for ${file.originalname}: ${error.message}`,
            500,
          );

        const fileUrl = supabase.storage
          .from("medical-records")
          .getPublicUrl(fileName).data.publicUrl;

        return MedicalRecord.create({
          appointmentId,
          filename: fileName,
          originalName: file.originalname,
          driveId: data.path,
          fileUrl,
        });
      }),
    );

    // Push all new record IDs onto the appointment
    const recordIds = uploadResults.map((r) => r._id);
    await Appointment.findByIdAndUpdate(appointmentId, {
      $push: { medicalRecords: { $each: recordIds } },
    });

    res.status(200).json({
      status: "success",
      results: uploadResults.length,
      data: { medicalRecords: uploadResults },
    });
  },
);

export const getMedicalRecords = catchAsync(async (req, res) => {
  const { appointmentId } = req.query;
  const filter: any = {};

  if (appointmentId) filter.appointmentId = appointmentId;

  const records = await MedicalRecord.find(filter);

  res.status(200).json({
    status: "success",
    results: records.length,
    data: { records },
  });
});

export const getMedicalRecord = catchAsync(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) return next(new AppError("Medical record not found", 404));

  res.status(200).json({
    status: "success",
    data: { record },
  });
});

export const updateMedicalRecord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return next(new AppError("Medical record not found", 404));

    if (req.file) {
      await deleteFromSupabase(record.driveId);

      const { path: filePath, url } = await uploadToSupabase(req.file);

      record.filename = req.file.filename;
      record.originalName = req.file.originalname;
      record.driveId = filePath;
      record.fileUrl = url;
    }

    if (req.body.appointmentId) record.appointmentId = req.body.appointmentId;

    await record.save();

    res.status(200).json({
      status: "success",
      data: { record },
    });
  },
);

export const deleteMedicalRecord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { appointmentId, recordId } = req.params;

    if (!appointmentId || !recordId)
      return next(new AppError("Missing appointmentId or recordId", 400));

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return next(new AppError("Appointment not found", 404));

    const record = await MedicalRecord.findById(recordId);
    if (!record) return next(new AppError("Medical record not found", 404));

    await deleteFromSupabase(record.driveId);

    await Appointment.findByIdAndUpdate(appointmentId, {
      $pull: { medicalRecords: record._id },
    });

    await MedicalRecord.findByIdAndDelete(record._id);

    res.status(204).json({ status: "success", data: null });
  },
);
