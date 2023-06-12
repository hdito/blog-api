import bcrypt from "bcryptjs";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { Env } from "../utils/env";
import { errorFactory } from "../utils/errorFactory";
import { failFactory } from "../utils/failFactory";
import { formatErrors } from "../utils/formatErrors";
import { successFactory } from "../utils/successFactory";

const signInController = Router();

signInController.post(
  "/sign-in",

  body("username")
    .trim()
    .escape()
    .if((value, { req }) => !(req.body.email && !req.body.username))
    .notEmpty()
    .withMessage("Username can't be empty")
    .toLowerCase(),
  body("email")
    .trim()
    .escape()
    .if((value, { req }) => !(!req.body.email && req.body.username))
    .notEmpty()
    .withMessage("Email can't be empty")
    .isEmail()
    .withMessage("Invalid email format")
    .toLowerCase(),
  body("password")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Password can't be empty"),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res
        .status(400)
        .json(
          failFactory(
            result.formatWith(formatErrors).array({ onlyFirstError: true })
          )
        );
    }

    try {
      const filter = req.body.username
        ? { username: req.body.username as string }
        : { email: req.body.email as string };
      const user = await User.findOne(filter);
      if (!user) {
        if (filter.username)
          return res.status(400).json(
            failFactory([
              {
                path: "username",
                message: "There is no user with such username",
              },
            ])
          );
        return res
          .status(400)
          .json(
            failFactory([
              { path: "email", message: "There is no user with such email" },
            ])
          );
      }

      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json(
            failFactory([{ message: "Invalid password", path: "password" }])
          );
      }
      const token = await new Promise<string>((resolve, reject) => {
        jwt.sign(
          {
            id: user._id,
            displayName: user.displayName,
            role: user.role,
          },
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
