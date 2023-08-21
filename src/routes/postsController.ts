import { Router } from "express";
import { body, validationResult } from "express-validator";
import { Post } from "../models/post";
import { checkIsValidRole } from "../utils/checkIsValidRole";
import { errorFactory } from "../utils/errorFactory";
import { extractAuthToken } from "../utils/extractAuthToken";
import { failFactory } from "../utils/failFactory";
import { formatErrors } from "../utils/formatErrors";
import { successFactory } from "../utils/successFactory";

const postsController = Router();

postsController.get("/", async (req, res) => {
  const { populate } = req.query;
  try {
    const postsQuery = Post.find({ isPublished: true }).sort({
      createdAt: -1,
    });
    if (populate === "author") {
      postsQuery.populate("author", { displayName: 1 });
    }
    const posts = await postsQuery;
    return res.status(200).json(successFactory({ posts }));
  } catch (error) {
    return res.status(500).json(errorFactory("Error on loading posts"));
  }
});

postsController.post(
  "/",
  extractAuthToken,
  checkIsValidRole(["author", "admin"]),
  body("title")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Title can't be empty"),
  body("description").trim().escape(),
  body("content").trim().escape(),
  body("isPublished").isBoolean().optional(),
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
      isPublished:
        req.body.isPublished !== undefined ? req.body.isPublished : false,
    });
    try {
      await post.save();
      return res.status(200).json(successFactory({ post }));
    } catch (error) {
      return res.status(500).json(errorFactory("Error on saving post"));
    }
  }
);

postsController.get("/:postId", async (req, res) => {
  const { populate } = req.query;
  const { postId } = req.params;
  try {
    const postQuery = Post.findById(postId);
    if (populate === "author") {
      postQuery.populate("author", { displayName: 1 });
    }
    const post = await postQuery;
    if (!post) {
      return res.status(404).json(errorFactory("Post not found"));
    }
    if (!post.isPublished) {
      return res
        .status(403)
        .json(errorFactory("You haven't got permission for this"));
    }
    return res.status(200).json(successFactory({ post }));
  } catch (error) {
    return res.status(500).json(errorFactory("Error on loading post"));
  }
});

postsController.patch(
  "/:postId",
  extractAuthToken,
  checkIsValidRole(["author", "admin"]),
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
  checkIsValidRole(["user", "admin"]),
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
