import { Router } from "express";
import { extractAuthToken } from "../utils/extractAuthToken";
import { Post } from "../models/post";
import { body, validationResult } from "express-validator";
import { checkIsValidRole } from "../utils/checkIsValidRole";

const postsController = Router();

postsController.get(
  "/",
  async (req, res, next) => {
    const { type } = req.query;

    if (type === "own") {
      return next();
    }

    try {
      const posts = await Post.find(
        { isPublished: true },
        { isPublished: false }
      )
        .sort({ createdAt: -1 })
        .populate("author", "_id username");
      return res.json({ posts });
    } catch (error) {
      return res.status(500).json({ error: "Error on loading posts" });
    }
  },
  extractAuthToken,
  checkIsValidRole,
  async (req, res) => {
    try {
      const posts = await Post.find({ author: req!.user!.id }).sort({
        createdAt: -1,
      });
      return res.status(200).json({ posts });
    } catch (error) {
      return res.status(500).json({ error: "Unknown error has occured" });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      author: req!.user!.id,
    });
    try {
      await post.save();
      return res
        .status(200)
        .json({ message: "You've successfully created post", post });
    } catch (error) {
      return res.status(500).json({ error: "Error on saving post" });
    }
  }
);

postsController.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate("author", "_id username");
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json({ post });
  } catch (error) {
    return res.status(500).json({ error: "Error on loading post" });
  }
});

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
    .optional(),
  body("content")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Description can't be empty")
    .optional(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
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
      if (req.body[key]) {
        updatePayload[key] = req.body[key];
      }
    });
    if (Object.keys(updatePayload).length === 0) {
      return res.status(200).json({ message: "Post update was successfull" });
    }

    const { postId } = req.params;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "There is no such post" });
      }

      if (post.author.toString() === req!.user!.id) {
        await Post.findByIdAndUpdate(postId, updatePayload);
        return res.status(200).json({ message: "Post update was successfull" });
      }

      return res.status(403).json({ error: "You have no permission for this" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error on post update has occured" });
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

      if (!post) return res.status(204).json({});
      if (
        req!.user!.id === post?.author.toString() ||
        (req!.user!.role === "admin" && post?.isPublished === true)
      ) {
        await Post.findByIdAndDelete(postId);
        return res.status(204).json({});
      }

      return res
        .status(403)
        .json({ error: "You haven't got permission for this" });
    } catch (error) {
      return res.status(500).json({ error: "Error on deleting post" });
    }
  }
);

export default postsController;
