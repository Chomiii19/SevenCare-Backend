import { Request, Response, NextFunction } from "express";
import { uploadToSupabase, deleteFromSupabase } from "../utils/drive";
import MedicalRecord from "../models/medicalRecord.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import multer from "multer";
import path from "path";
import fs from "fs";
import { supabase } from "../configs/supabaseClient";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadMedicalRecord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { appointmentId } = req.body;
    if (!appointmentId) return next(new AppError("Missing appointmentId", 400));
    if (!req.file) return next(new AppError("No file uploaded", 400));

    // Upload file to Supabase bucket
    const filePathInBucket = `medical-records/${Date.now()}-${
      req.file.originalname
    }`;
    const fileStream = fs.createReadStream(req.file.path);

    const { data, error } = await supabase.storage
      .from("medical-records")
      .upload(filePathInBucket, fileStream);

    if (error) return next(new AppError("Failed to upload file", 500));

    // Get public URL
    const fileUrl = supabase.storage
      .from("medical-records")
      .getPublicUrl(filePathInBucket).data.publicUrl;

    // Save to DB
    const medicalRecord = await MedicalRecord.create({
      appointmentId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileUrl,
    });

    // Optionally delete local file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      status: "success",
      data: { medicalRecord },
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

      const { path, url } = await uploadToSupabase(req.file);

      record.filename = req.file.filename;
      record.originalName = req.file.originalname;
      record.driveId = path;
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
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) return next(new AppError("Medical record not found", 404));

    await deleteFromSupabase(record.driveId);

    res.status(204).json({ status: "success", data: null });
  },
);
