export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_URL: string;
      JWT_SECRET: string;
      NODE_ENV: string;
    }
  }
}
