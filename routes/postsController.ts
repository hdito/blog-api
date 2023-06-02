import { Router } from "express";
import { body, validationResult } from "express-validator";
import { Post } from "../models/post";
import { checkIsValidRole } from "../utils/checkIsValidRole";
import { errorFactory } from "../utils/errorFactory";
import { extractAuthToken } from "../utils/extractAuthToken";
import { failFactory } from "../utils/failFactory";
import { successFactory } from "../utils/successFactory";
import { formatErrors } from "../utils/formatErrors";

const postsController = Router();

postsController.get(
  "/",
  async (req, res, next) => {
    const { type, populate } = req.query;

    if (type === "own") {
      return next();
    }

    try {
      if (populate === "author") {
        const posts = await Post.find({ isPublished: true })
          .sort({
            createdAt: -1,
          })
          .populate("author", "_id username");
        return res.status(200).json(successFactory({ posts }));
      }

      const posts = await Post.find({ isPublished: true }).sort({
        createdAt: -1,
      });
      return res.status(200).json(successFactory({ posts }));
    } catch (error) {
      return res.status(500).json(errorFactory("Error on loading posts"));
    }
  },
  extractAuthToken,
  checkIsValidRole,
  async (req, res) => {
    const { populate } = req.query;
    try {
      if (populate === "author") {
        const posts = await Post.find({ author: req!.user!.id })
          .sort({
            createdAt: -1,
          })
          .populate("author", "_id username");
        return res.status(200).json(successFactory({ posts }));
      }

      const posts = await Post.find({ author: req!.user!.id }).sort({
        createdAt: -1,
      });
      return res.status(200).json(successFactory({ posts }));
    } catch (error) {
      return res.status(500).json(errorFactory("Unknown error has occured"));
    }
  }
);

postsController.post(
  "/",
  extractAuthToken,
  checkIsValidRole,
  body("title")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Title can't be empty"),
  body("description").trim().escape(),
  body("content").trim().escape(),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res
        .status(400)
        .json(failFactory(result.formatWith(formatErrors).array()));
    }

    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      author: req!.user!.id,
    });
    try {
      await post.save();
      return res.status(200).json(successFactory({ post }));
    } catch (error) {
      return res.status(500).json(errorFactory("Error on saving post"));
    }
  }
);

postsController.get(
  "/:postId",
  async (req, res, next) => {
    const { type, populate } = req.query;
    if (type === "preview") return next();

    const { postId } = req.params;
    try {
      const post = await Post.findById(postId);

      if (!post) return res.status(404).json(errorFactory("Post not found"));
      if (!post.isPublished)
        return res
          .status(403)
          .json(errorFactory("You haven't got permission for this"));

      if (populate === "author") {
        await post.populate("author", "_id username");
      }
      return res.status(200).json(successFactory({ post }));
    } catch (error) {
      return res.status(500).json(errorFactory("Error on loading post"));
    }
  },
  extractAuthToken,
  checkIsValidRole,
  async (req, res) => {
    const { postId } = req.params;
    const { populate } = req.query;
    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json(errorFactory("Post not found"));
      if (post.author._id.toString() !== req.user!.id)
        return res
          .status(403)
          .json(errorFactory("You haven't got permission for this"));
      if (populate === "author") {
        await post.populate("author", "_id username");
      }
      return res.status(200).json(successFactory({ post }));
    } catch (error) {
      return res.status(500).json(errorFactory("Error on loading post"));
    }
  }
);

postsController.put(
  "/:postId",
  extractAuthToken,
  checkIsValidRole,
  body("isPublished").isBoolean().optional(),
  body("title")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Title can't be empty")
    .optional(),
  body("description")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Description can't be empty")
    .optional({ values: "falsy" }),
  body("content")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Content can't be empty")
    .optional({ values: "falsy" }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(failFactory(errors.formatWith(formatErrors).array()));
    }

    const updatePayload: {
      description?: string;
      content?: string;
      isPublished?: boolean;
      title?: string;
    } = {};
    const allowedKeys = [
      "title",
      "isPublished",
      "description",
      "content",
    ] as const;
    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) {
        updatePayload[key] = req.body[key];
      }
    });
    const { postId } = req.params;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json(errorFactory("There is no such post"));
      }

      if (post.author.toString() !== req!.user!.id) {
        return res
          .status(403)
          .json(errorFactory("You have no permission for this"));
      }

      if (Object.keys(updatePayload).length === 0) {
        console.log("Empty payload");
        return res.status(200).json(successFactory());
      }

      await Post.findByIdAndUpdate(postId, updatePayload);
      return res.status(200).json(successFactory());
    } catch (error) {
      return res.status(500).json(errorFactory("Unknwon error has occured"));
    }
  }
);

postsController.delete(
  "/:postId",
  extractAuthToken,
  checkIsValidRole,
  async (req, res) => {
    const { postId } = req.params;
    try {
      const post = await Post.findById(postId);

      if (!post) return res.status(204).json(successFactory());
      if (
        !(
          req!.user!.id === post?.author.toString() ||
          (req!.user!.role === "admin" && post?.isPublished === true)
        )
      ) {
        return res
          .status(403)
          .json(errorFactory("You haven't got permission for this"));
      }

      await Post.findByIdAndDelete(postId);
      return res.status(204).json(successFactory());
    } catch (error) {
      return res.status(500).json(errorFactory("Unknown error has occured"));
    }
  }
);

export default postsController;
