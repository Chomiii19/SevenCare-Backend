import { Request, Response, NextFunction } from "express";
import { deleteFromDrive, uploadToDrive } from "../utils/drive";
import MedicalRecord from "../models/medicalRecord.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

export const uploadMedicalRecord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return next(new AppError("Missing appointmentId", 400));
    }

    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const driveId = await uploadToDrive(req.file.path, req.file.filename);

    const medicalRecord = await MedicalRecord.create({
      appointmentId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      driveId,
    });

    res.status(200).json({
      status: "success",
      data: {
        medicalRecord,
      },
    });
  },
);

export const getMedicalRecords = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { appointmentId } = req.query;
    const filter: any = {};
    if (appointmentId) filter.appointmentId = appointmentId;

    const records = await MedicalRecord.find(filter);

    res.status(200).json({
      status: "success",
      results: records.length,
      data: { records },
    });
  },
);

export const getMedicalRecord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return next(new AppError("Medical record not found", 404));

    res.status(200).json({
      status: "success",
      data: { record },
    });
  },
);

export const updateMedicalRecord = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return next(new AppError("Medical record not found", 404));

    if (req.file) {
      await deleteFromDrive(record.driveId);
      const driveId = await uploadToDrive(req.file.path, req.file.filename);

      record.filename = req.file.filename;
      record.originalName = req.file.originalname;
      record.driveId = driveId;
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

    await deleteFromDrive(record.driveId);

    res.status(204).json({ status: "success", data: null });
  },
);
