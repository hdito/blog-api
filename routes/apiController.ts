import { Router } from "express";
import postsController from "./postsController";
import signInController from "./signInController";
import signUpController from "./signUpController";

const apiController = Router();

apiController.use("/", signInController);
apiController.use("/", signUpController);
apiController.use("/posts", postsController);

export default apiController;
