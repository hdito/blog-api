import { NextFunction, Request, Response } from "express";

export function checkIsValidRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(req.user?.id && req.user?.role))
    return res.status(403).json({ status: "error", message: "Invalid token" });

  if (!(req.user.role === "admin" || req.user.role === "author")) {
    return res
      .status(403)
      .json({
        status: "error",
        message: "You haven't got permission for this",
      })
      .json({
        status: "error",
        message: "You haven't got permission for this",
      });
  }
  next();
}
