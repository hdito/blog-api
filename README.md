# Blog API

A Node.js server for a blog platform.

## Stack

- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- Swagger

## Project setup

1. Clone the project with the command

```bash
git clone https://github.com/hdito/blog-api.git
```

2. Install dependencies with the command

```bash
pnpm install
```

3. Create the file `.env` in the root of the project. Fill its contents with environment variables values according to `.env.example` with the url of a MongoDB database for this project in the variable `DB_URL`.
4. You could start a development server with the command

```bash
pnpm dev
```

And a production server with

```bash
pnpm start
```

5. To view docs of the project switch to the `feature/docs` branch and go to the url `http://localhost:<PORT>/api/docs` in a browser.
