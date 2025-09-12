import { NextFunction, Request, Response } from "express";

type PromiseFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

const catchAsync = (fn: PromiseFunction) => {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch((err: Error) => next(err));
};

export default catchAsync;
