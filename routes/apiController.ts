import { Router } from "express";
import postsController from "./postsController";
import signInController from "./signInController";
import signUpController from "./signUpController";
import commentsController from "./commentsController";

const apiController = Router();

apiController.use("/", signInController);
apiController.use("/", signUpController);
apiController.use("/posts", postsController);
apiController.use("/posts", commentsController);

export default apiController;
