import express from "express";
import mongoose from "mongoose";
import apiController from "./routes/apiController";
import { Env } from "./utils/env";
import { errorHadler } from "./utils/errorHandler";
import { notFoundHandler } from "./utils/notFoundHandler";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const whitelist = Env.SUPPORTED_URLS.split(" ");

mongoose
  .connect(Env.DB_URL)
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

app.use(
  cors({
    origin: (origin, cb) => {
      if (
        (origin && whitelist.includes(origin)) ||
        (Env.NODE_ENV === "development" && !origin)
      ) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", apiController);

app.use(notFoundHandler);
app.use(errorHadler);

app.listen(Env.PORT, () =>
  console.log(`Server is running on port ${Env.PORT}`)
);
