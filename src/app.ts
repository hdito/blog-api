import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import apiController from "./routes/apiController";
import { Env } from "./utils/env";
import { errorHadler } from "./utils/errorHandler";
import { notFoundHandler } from "./utils/notFoundHandler";

mongoose
  .connect(Env.DB_URL, { connectTimeoutMS: 2000 })
  .then(() => console.log("Connected to DB!!!"))
  .catch(() => console.error("Mongo connection error"));
const db = mongoose.connection;
db.on("error", () => console.error("Mongo connection error"));

const app = express();

if (Env.NODE_ENV === "production") {
  app.use(
    rateLimit({
      max: 15,
    })
  );
  app.use(compression());
  app.use(helmet({ crossOriginResourcePolicy: false }));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", apiController);

app.use(notFoundHandler);
app.use(errorHadler);

app.listen(Number(Env.PORT), "0.0.0.0", () =>
  console.log(`Server is running on port ${Env.PORT}`)
);

console.log(Env.JWT_SECRET);
