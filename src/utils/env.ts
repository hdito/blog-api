import dotenv from "dotenv-safe";
import fs from "fs";

class EnvVariables {
  PORT: string;
  DB_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;

  constructor() {
    dotenv.config();
    this.PORT = process.env.PORT;
    this.DB_URL = process.env.DB_URL;
    this.NODE_ENV = process.env.NODE_ENV;
    this.JWT_SECRET = fs.readFileSync(process.env.JWT_SECRET, "utf-8");
  }
}

export const Env = new EnvVariables();
