import { Router } from "express";
import { secureRouteForPosts } from "../utils/secureRouteForPosts";
import { Post } from "../models/post";
import { body, validationResult } from "express-validator";

const postsController = Router();

postsController.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "_id username");
    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({ error: "Error on loading posts" });
  }
});

postsController.post(
  "/",
  secureRouteForPosts,
  body("title")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("Title can't be empty"),
  body("description").trim().escape(),
  body("content").trim().escape(),
  body("author").trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      author: req.body.author,
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
    return res.json(post);
  } catch (error) {
    return res.status(500).json({ error: "Error on loading post" });
  }
});

postsController.put(
  "/:postId",
  secureRouteForPosts,
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
      return res.status(200).json({ message: "Empty payload" });
    }
    try {
      await Post.findByIdAndUpdate(req.params.postId, updatePayload);
      return res.status(200).json({ message: "Post update was successfull" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error on post update has occured" });
    }
  }
);

postsController.delete("/:postId", secureRouteForPosts, async (req, res) => {
  const postId = req.params;
  try {
    const post = await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post has been successfully deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Error on deleting post" });
  }
});

export default postsController;
