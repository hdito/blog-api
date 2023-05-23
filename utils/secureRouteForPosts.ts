import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Env } from "./env";

export async function secureRouteForPosts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decodedToken = await new Promise<string | jwt.JwtPayload>(
      (res, rej) => {
        jwt.verify(token, Env.JWT_SECRET, (err, decoded) => {
          if (err) {
            rej(err);
          }
          res(decoded!);
        });
      }
    );

    if (
      !(
        typeof decodedToken === "object" &&
        decodedToken.id &&
        decodedToken.role &&
        (decodedToken.role === "author" || decodedToken.role === "admin") &&
        ((decodedToken.role === "author" &&
          decodedToken.id === req.body.author) ||
          decodedToken.role === "admin")
      )
    ) {
      return res
        .status(403)
        .json({ error: "You haven't got permission for this" });
    }

    return next();
  } catch (error) {
    return res
      .status(403)
      .json({ error: "You haven't got permission for this" });
  }
}
