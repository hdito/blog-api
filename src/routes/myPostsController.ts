import { Router } from "express";
import { Post } from "../models/post";
import { checkIsValidRole } from "../utils/checkIsValidRole";
import { errorFactory } from "../utils/errorFactory";
import { extractAuthToken } from "../utils/extractAuthToken";
import { successFactory } from "../utils/successFactory";

const myPostsController = Router();

myPostsController.get(
  "/",
  extractAuthToken,
  checkIsValidRole(["author", "admin"]),
  async (req, res) => {
    const { populate } = req.query;
    try {
      const postsQuery = Post.find({ author: req!.user!.id }).sort({
        createdAt: -1,
      });
      if (populate === "author") {
        postsQuery.populate("author", { displayName: 1 });
      }
      const posts = await postsQuery;
      return res.status(200).json(successFactory({ posts }));
    } catch (error) {
      return res.status(500).json(errorFactory("Unknown error has occured"));
    }
  }
);

myPostsController.get(
  "/:postId",
  extractAuthToken,
  checkIsValidRole(["author", "admin"]),
  async (req, res) => {
    const { postId } = req.params;
    const { populate } = req.query;
    try {
      const postQuery = Post.findById(postId);
      if (populate === "author") {
        postQuery.populate("author", { displayName: 1 });
      }
      const post = await postQuery;
      if (!post) {
        return res.status(404).json(errorFactory("Post not found"));
      }
      if (post.author._id.toString() !== req.user!.id) {
        return res
          .status(403)
          .json(errorFactory("You haven't got permission for this"));
      }
      return res.status(200).json(successFactory({ post }));
    } catch (error) {
      return res.status(500).json(errorFactory("Error on loading post"));
    }
  }
);

export default myPostsController;
