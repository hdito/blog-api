import dotenv from "dotenv-safe";

class EnvVariables {
  PORT: string;
  DB_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;

  constructor() {
    dotenv.config();
    this.PORT = process.env.PORT;
    this.DB_URL = process.env.DB_URL;
    this.JWT_SECRET = process.env.JWT_SECRET;
    this.NODE_ENV = process.env.NODE_ENV;
  }
}

export const Env = new EnvVariables();
