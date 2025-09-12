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

    const updates: Partial<IUser> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (updates as any)[field] = req.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) return next(new AppError("User not found", 404));

    res.status(200).json({
      status: "Success",
      msg: "Account updated successfully",
      data: updatedUser,
    });
  },
);
