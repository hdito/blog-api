import express from "express";
import mongoose from "mongoose";
import apiController from "./routes/apiController";
import { Env } from "./utils/env";
import { errorHadler } from "./utils/errorHandler";
import { notFoundHandler } from "./utils/notFoundHandler";

mongoose.connect(Env.DB_URL);
const db = mongoose.connection;
db.on("error", () => console.error("Mongo connection error"));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", apiController);

app.use(notFoundHandler);
app.use(errorHadler);

app.listen(Env.SERVER_PORT, () =>
  console.log(`Server is running on port ${Env.SERVER_PORT}`)
);
