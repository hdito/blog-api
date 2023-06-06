import { NextFunction, Request, Response } from "express";
import { errorFactory } from "./errorFactory";

export function checkIsValidRole(validRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req.user?.id && req.user?.role)) {
      return res.status(403).json(errorFactory("Invalid token"));
    }
    if (!validRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(errorFactory("You haven't got permission for this"));
    }
    next();
  };
}
