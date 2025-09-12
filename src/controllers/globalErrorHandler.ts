import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/appError";

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR: ", err);
    res.status(500).json({
      status: "Error",
      message: "Something went wrong!",
    });
  }
};

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  if (process.env.NODE_ENV === "DEVELOPMENT") sendErrorDev(err, res);
  if (process.env.NODE_ENV === "PRODUCTION") {
    const error = { ...err };

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;