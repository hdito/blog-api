import { NextFunction, Request, Response } from "express";

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(404);

  if (req.accepts("json")) {
    res.json({ error: "Not found" });
    return;
  }

  res.type("txt").send("Not found");
}
