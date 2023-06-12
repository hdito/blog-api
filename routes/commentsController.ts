import { Router } from "express";
import { body, validationResult } from "express-validator";
import { Comment } from "../models/comment";
import { checkIsValidRole } from "../utils/checkIsValidRole";
import { errorFactory } from "../utils/errorFactory";
import { extractAuthToken } from "../utils/extractAuthToken";
import { failFactory } from "../utils/failFactory";
import { formatErrors } from "../utils/formatErrors";
import { successFactory } from "../utils/successFactory";
import { Post } from "../models/post";

const commentsController = Router();

commentsController.get("/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ postId }).populate("author", {
      displayName: 1,
    });
    return res.status(200).json(successFactory({ comments }));
  } catch {
    return res.status(500).json(errorFactory("Error on loading comments"));
  }
});

commentsController.post(
  "/:postId/comments",
  extractAuthToken,
  checkIsValidRole(["user", "author", "admin"]),
  body("body").notEmpty().withMessage("Body can't be empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(failFactory(errors.formatWith(formatErrors).array()));
    }
    const { postId } = req.params;

    const comment = new Comment({
      body: req.body.body,
      author: req.user!.id,
      postId,
    });
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json(errorFactory("There is no such post"));
      }

      await comment.save();
      return res.status(200).json({ comment });
    } catch (error) {
      return res.status(500).json(errorFactory("Error on creating post"));
    }
  }
);

commentsController.delete(
  "/:postId/comments/:commentId",
  extractAuthToken,
  checkIsValidRole(["user", "author", "admin"]),
  async (req, res) => {
    const { commentId } = req.params;
    try {
      const comment = await Comment.findById(commentId).populate("author", {
        displayName: 1,
      });
      if (
        !(
          req.user!.id === comment?.author._id.toString() ||
          req.user!.role === "admin"
        )
      ) {
        return res
          .status(404)
          .json(errorFactory("You have no permission for this"));
      }
      await Comment.findByIdAndDelete(commentId);
      return res.status(204).json(successFactory());
    } catch {
      return res.status(500).json(errorFactory("Error on deleting post"));
    }
  }
);

export default commentsController;
