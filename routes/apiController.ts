import { Router } from "express";
import postsController from "./postsController";
import signInController from "./signInController";
import signUpController from "./signUpController";
import commentsController from "./commentsController";
import usersController from "./usersController";

const apiController = Router();

apiController.use("/", signInController);
apiController.use("/", signUpController);
apiController.use("/posts", postsController);
apiController.use("/posts", commentsController);
apiController.use("/users", usersController);

export default apiController;
