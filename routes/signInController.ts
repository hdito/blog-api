import { compare } from "bcryptjs";
import { Router } from "express";
import { body, oneOf, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { Env } from "../utils/env";
import { errorFactory } from "../utils/errorFactory";
import { failFactory } from "../utils/failFactory";
import { successFactory } from "../utils/successFactory";
import { formatErrors } from "../utils/formatErrors";

const signInController = Router();

signInController.post(
  "/sign-in",
  oneOf(
    [
      body("username")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Username can't be empty"),

      body("email")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Email can't be empty")
        .isEmail()
        .withMessage("Invalid email format"),
    ],
    { errorType: "flat" }
  ),
  body("password")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Password can't be empty"),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res
        .status(400)
        .json(failFactory(result.formatWith(formatErrors).mapped()));
    }

    try {
      const filter =
        typeof req.body.username === "string"
          ? { username: req.body.username as string }
          : { email: req.body.email as string };
      const user = await User.findOne(filter);
      if (!user) {
        if (filter.username)
          return res
            .status(400)
            .json(failFactory({ username: "Invalid username" }));
        return res.status(400).json(failFactory({ email: "Invalid email" }));
      }

      const isPasswordValid = await compare(req.body.password, user.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json(failFactory({ password: "Invalid password" }));
      }

      const token = await new Promise<string>((resolve, reject) => {
        jwt.sign(
          { id: user._id, username: user.username, role: user.role },
          Env.JWT_SECRET,
          (err: Error | null, token: string | undefined) => {
            if (err) {
              return reject(err);
            }
            return resolve(token!);
          }
        );
      });
      return res.status(200).json(successFactory({ token }));
    } catch (error) {
      return res.status(500).json(errorFactory("Unknown error has occured"));
    }
  }
);

export default signInController;
