import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Env } from "./env";

export async function extractAuthToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Authentication required" });
  }

  try {
    const decodedToken = await new Promise<jwt.JwtPayload>((res, rej) => {
      jwt.verify(token, Env.JWT_SECRET, (err, decoded) => {
        if (err) {
          rej(err);
        }
        res(decoded as jwt.JwtPayload);
      });
    });

    req.user = decodedToken;

    return next();
  } catch (error) {
    return res
      .status(403)
      .json({
        status: "error",
        message: "You haven't got permission for this",
      });
  }
}
