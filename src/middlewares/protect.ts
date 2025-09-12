import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import verifyToken from "../utils/verifyToken";
import User from "../models/user.model";

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.authToken;

    if (!token) return next(new AppError("No token found", 404));
    const decodedToken = verifyToken(token) as { userId: string };
    const user = await User.findById(decodedToken.userId);

    if (!user)
      return next(
        new AppError("User belonging to this token does not exist", 404),
      );

    req.user = user;
    next();
  },
);

export default protect;
