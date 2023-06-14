import { Router } from "express";
import { User } from "../models/user";
import { successFactory } from "../utils/successFactory";
import { errorFactory } from "../utils/errorFactory";
import { extractAuthToken } from "../utils/extractAuthToken";
import { checkIsValidRole } from "../utils/checkIsValidRole";
import { body, validationResult } from "express-validator";
import { supportedRoles } from "../utils/supportedRoles";
import { failFactory } from "../utils/failFactory";
import { formatErrors } from "../utils/formatErrors";

const usersController = Router();

usersController.get(
  "/",
  extractAuthToken,
  checkIsValidRole(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find({}, { password: 0 });
      return res.status(200).json(successFactory({ users }));
    } catch {
      return res
        .status(500)
        .json(errorFactory("Unknown error on loading users"));
    }
  }
);

usersController.get(
  "/:userId",
  extractAuthToken,
  checkIsValidRole(["admin"]),
  async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId, { password: 0 });
      if (!user) {
        return res.status(404).json(errorFactory("User not found"));
      }
      return res.status(200).json(successFactory({ user }));
    } catch {
      return res
        .status(500)
        .json(errorFactory("Unknown error on loading user"));
    }
  }
);

usersController.patch(
  "/:userId",
  extractAuthToken,
  checkIsValidRole(["admin"]),
  body("role")
    .custom((value) => supportedRoles.includes(value))
    .withMessage("Role can only be admin, author or user"),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res
        .status(400)
        .json(failFactory(result.formatWith(formatErrors).array()));
    }
    const { userId } = req.params;

    try {
      const post = await User.findByIdAndUpdate(userId, {
        role: req.body.role,
      });
      if (!post) {
        return res.status(404).json(errorFactory("Post not found"));
      }
      return res.status(200).json(successFactory());
    } catch {
      return res
        .status(500)
        .json(errorFactory("Unknown error on updating user"));
    }
  }
);

export default usersController;
