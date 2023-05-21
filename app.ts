import express, { urlencoded } from "express";
import dotenv from "dotenv-safe";

dotenv.config();

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: false }));

app.get("/api", (req, res) => {
  return res.send("Welcome to blog api");
});

app.listen(process.env.SERVER_PORT, () =>
  console.log(`Server is running on port ${process.env.SERVER_PORT}`)
);
