export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVER_PORT: string;
      DB_URL: string;
      JWT_SECRET: string;
      SUPPORTED_URLS: string;
    }
  }
}
