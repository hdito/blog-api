import { compare } from "bcryptjs";
import { Router } from "express";
import { oneOf, body, validationResult } from "express-validator";
import { User } from "../models/user";
import { Env } from "../utils/env";
import jwt from "jsonwebtoken";

const signInController = Router();

signInController.post(
  "/sign-in",
  oneOf([
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
  ]),
  body("password")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Password can't be empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    }

    try {
      const filter =
        typeof req.body.username === "string"
          ? { username: req.body.username as string }
          : { email: req.body.email as string };
      const user = await User.findOne(filter);
      if (!user) {
        return res
          .status(400)
          .json({ error: "Incorrect username or password" });
      }

      const isPasswordValid = await compare(req.body.password, user.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: "Incorrect username or password" });
      }

      const token = await new Promise<string>((resolve, reject) => {
        jwt.sign(
          { id: user._id, role: user.role },
          Env.JWT_SECRET,
          (err: Error | null, token: string | undefined) => {
            if (err) {
              return reject(err);
            }
            return resolve(token!);
          }
        );
      });

      return res
        .status(200)
        .json({ message: "You've successfully signed in", token });
    } catch (error) {
      return res.status(500).json({ error: "Unknown error has occured" });
    }
  }
);

export default signInController;
