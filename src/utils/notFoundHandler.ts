import { NextFunction, Request, Response } from "express";
import { status } from "./status";

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return res.status(404).json({ status: status.error, message: "Not found" });
}
