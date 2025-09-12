import { NextFunction, Response, Request } from "express";
import catchAsync from "../utils/catchAsync";
import { IUser } from "../@types/interfaces";
import User from "../models/user.model";
import AppError from "../utils/appError";

export const myAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: "Success", data: req.user });
  },
);

export const updateAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allowedFields = [
      "firstname",
      "surname",
      "birthDate",
      "address",
      "email",
      "phoneNumber",
      "password",
    ];

    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError("User not found", 404));

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    }

    await user.save();

    res.status(200).json({
      status: "Success",
      msg: "Account updated successfully",
      data: user,
    });
  },
);
