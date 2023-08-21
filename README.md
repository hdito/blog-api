# Blog API

A Node.js server for a blog platform.

## Stack

- Express
- TypeScript
- MongoDB
- Mongoose
- JWT

## Recommended development setup

Prerequisites:

- Docker Desktop

1. Clone the project with the command:

```bash
git clone https://github.com/hdito/blog-api.git
```

2. Create a file with the value of JWT secret in the project root.
3. Run Docker container with the development environment.

```bash
docker compose up -d
```

This command will start an application server with MongoDB. Now you could send your requests to `localhost:3000`

```bash
curl http://localhost:3000/api/posts
```
