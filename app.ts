import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import helmet from "helmet";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import yaml from "yaml";
import apiController from "./routes/apiController";
import { Env } from "./utils/env";
import { errorHadler } from "./utils/errorHandler";
import { notFoundHandler } from "./utils/notFoundHandler";

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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", apiController);

const file = fs.readFileSync("./docs.yaml", "utf8");
const swaggerDocument = yaml.parse(file);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(notFoundHandler);
app.use(errorHadler);

app.listen(Env.PORT, () =>
  console.log(`Server is running on port ${Env.PORT}`)
);
