import dotenv from "dotenv-safe";

class EnvVariables {
  SERVER_PORT: string;
  DB_URL: string;
  JWT_SECRET: string;
  SUPPORTED_URLS: string;

  constructor() {
    dotenv.config();
    this.SERVER_PORT = process.env.SERVER_PORT;
    this.DB_URL = process.env.DB_URL;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.SUPPORTED_URLS = process.env.SUPPORTED_URLS;
  }
}

export const Env = new EnvVariables();
