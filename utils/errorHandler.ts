import { NextFunction, Request, Response } from "express";

export function errorHadler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(500).json({ error: "Unknown error" });
}
