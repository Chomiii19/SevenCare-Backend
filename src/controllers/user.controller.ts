import { NextFunction, Response, Request } from "express";
import catchAsync from "../../utils/catchAsync";

export const myAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: "Success", data: req.user });
  },
);