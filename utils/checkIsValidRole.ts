import { NextFunction, Request, Response } from "express";

export function checkIsValidRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(req.user?.id && req.user?.role))
    return res.status(403).json({ error: "Invalid token" });

  if (!(req.user.role === "admin" || req.user.role === "author")) {
    return res
      .status(403)
      .json({ error: "You haven't got permission for this" });
  }
  next();
}
