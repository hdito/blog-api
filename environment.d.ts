export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_URL: string;
      JWT_SECRET: string;
      SUPPORTED_URLS: string;
      NODE_ENV: string;
    }
  }
}
