import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import Doctor from "../models/doctor.model";

export const createDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstname, middlename, surname, specialization } = req.body;

    if (!firstname || !middlename || !surname || !specialization)
      return next(new AppError("All fields must be filled.", 400));

    await Doctor.create({
      firstname,
      middlename,
      surname,
      specialization,
    });

    res.status(201).json({
      status: "Success",
      message: "Doctor successfully created",
    });
  },
);

export const getDoctors = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { specialization, search } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (specialization) filter.specialization = specialization;

    if (search) {
      const regex = new RegExp(search as string, "i");

      filter.$or = [
        { firstname: { $regex: regex } },
        { middlename: { $regex: regex } },
        { surname: { $regex: regex } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstname", " ", "$surname"] },
              regex: search,
              options: "i",
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$firstname", " ", "$middlename", " ", "$surname"],
              },
              regex: search,
              options: "i",
            },
          },
        },
      ];
    }

    const total = await Doctor.countDocuments(filter);

    const doctors = await Doctor.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      total,
      results: doctors.length,
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: doctors,
    });
  },
);

export const getDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id) return next(new AppError("ID not found", 404));

    const doctor = await Doctor.findById(id);

    if (!doctor) return next(new AppError("Doctor not found", 404));

    res.status(200).json({ status: "Success", data: doctor });
  },
);

export const updateDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id) return next(new AppError("ID not found", 404));

    const doctor = await Doctor.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) return next(new AppError("Doctor not found", 404));

    res.status(200).json({
      status: "Success",
      message: "Doctor updated successfully",
      data: doctor,
    });
  },
);

export const deleteDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id) return next(new AppError("ID not found", 404));

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) return next(new AppError("Doctor not found", 404));

    res.status(200).json({
      status: "Success",
      message: "Doctor deleted successfully",
    });
  },
);
