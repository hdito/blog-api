FROM node:lts-bullseye-slim AS base
COPY package.json package-lock.json tsconfig.json .env.example /app/
WORKDIR /app

FROM base as dev
RUN apt-get update && apt-get install -y libcurl4
ENV NODE_ENV=development
RUN npm ci
EXPOSE 3000
CMD [ "npm", "run", "dev" ]