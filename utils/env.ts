import dotenv from "dotenv-safe";

class EnvVariables {
  SERVER_PORT: string;
  DB_URL: string;
  JWT_SECRET: string;

  constructor() {
    dotenv.config();
    this.SERVER_PORT = process.env.SERVER_PORT;
    this.DB_URL = process.env.DB_URL;
    this.JWT_SECRET = process.env.JWT_SECRET;
  }
}

export const Env = new EnvVariables();
