import { Router } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/user";

const signUpController = Router();

signUpController.post(
  "/sign-up",
  body("username")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Username can't be empty")
    .custom(async (value) => {
      try {
        const existingUser = await User.findOne({ username: value });
        if (existingUser) {
          throw Error("Username is already in use");
        }
        return true;
      } catch (error) {
        throw Error("Unknown error. Try again later");
      }
    })
    .withMessage("Username is already in use"),
  body("email")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Email can't be empty")
    .custom(async (value) => {
      try {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw Error("Email is already in use");
        }
        return true;
      } catch (error) {
        throw Error("Unknown error. Try again later");
      }
    })
    .withMessage("Email is already in use"),
  body("password")
    .trim()
    .escape()
    .isStrongPassword()
    .withMessage(
      "Password must contain at least 8 characters and constist of special symbols, numbers, uppercase and lowercase letters"
    ),
  body("password2")
    .trim()
    .escape()
    .isStrongPassword({ minLength: 8, minNumbers: 1 })
    .withMessage(
      "Password must contain at least 8 characters and constist of special symbols, numbers, uppercase and lowercase letters"
    )
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords must match"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: "user",
    });

    try {
      await user.save();
    } catch (error) {
      res.status(500).json({ error: "Error on signing up" });
    }
    return res.status(200).json({ message: "You've successfully signed up" });
  }
);

export default signUpController;
