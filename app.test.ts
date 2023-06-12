import express from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import apiController from "./routes/apiController";
import { initializeMongoTest } from "./utils/initializeMongoTest";
import { userDummies } from "./utils/userDummies";
import { postDummies } from "./utils/postDummies";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", apiController);

describe("Server", () => {
  beforeAll(async () => {
    await initializeMongoTest();
    await userDummies.addToDb();
    await postDummies.addToDb();
  });

  it("Signs up and signs in user", async () => {
    const username = "Example user";
    const email = "example@mail.com";
    const password = "Password9";

    const signUpResult = await request(app).post("/sign-up").send({
      username,
      email,
      password,
      password2: password,
    });
    expect(signUpResult.status).toBe(200);

    const signInWithUsernameResponse = await request(app)
      .post("/sign-in")
      .send({
        username,
        password,
      });
    expect(signInWithUsernameResponse.status).toBe(200);
    expect(signInWithUsernameResponse.body.data.token).toBeDefined();

    const signInWithEmailResponse = await request(app).post("/sign-in").send({
      email,
      password,
    });
    expect(signInWithEmailResponse.status).toBe(200);
    expect(signInWithEmailResponse.body.data.token).toBeDefined();

    const signInWithEmailAndUsernameResponse = await request(app)
      .post("/sign-in")
      .send({
        email,
        username,
        password,
      });
    expect(signInWithEmailAndUsernameResponse.status).toBe(200);
    expect(signInWithEmailAndUsernameResponse.body.data.token).toBeDefined();
  });

  it("Allows creating post for admins", async () => {
    const signInResponse = await request(app).post("/sign-in").send({
      username: userDummies.admin.username,
      password: userDummies.admin.password,
    });
    expect(signInResponse.status).toBe(200);
    expect(signInResponse.body.data.token).toBeDefined();

    const adminAuthToken = signInResponse.body.data.token as string;

    const postTitle = "Test post";
    const createPostResponse = await request(app)
      .post("/posts")
      .auth(adminAuthToken, { type: "bearer" })
      .send({
        title: postTitle,
        isPublished: true,
      });
    expect(createPostResponse.status).toBe(200);
    expect(createPostResponse.body.data.post).toBeDefined();

    const postId = createPostResponse.body.data.post._id as string;
    const getPostResponse = await request(app).get(`/posts/${postId}`);
    expect(getPostResponse.status).toBe(200);
    expect(getPostResponse.body.data.post.title).toBe(postTitle);
  });

  it("Disallows creating posts for users", async () => {
    const signInResponse = await request(app).post("/sign-in").send({
      email: userDummies.user.email,
      password: userDummies.user.password,
    });
    expect(signInResponse.status).toBe(200);
    expect(signInResponse.body.data.token).toBeDefined();

    const authToken = signInResponse.body.data.token as string;

    const createPostResponse = await request(app)
      .post("/posts")
      .auth(authToken, { type: "bearer" })
      .send({
        title: "Post title",
        isPublished: true,
      });
    expect(createPostResponse.status).toBe(403);
  });

  it("Posts users comments", async () => {
    const signInResponse = await request(app).post("/sign-in").send({
      email: userDummies.user.email,
      password: userDummies.user.password,
    });
    expect(signInResponse.status).toBe(200);
    expect(signInResponse.body.data.token).toBeDefined();

    const authToken = signInResponse.body.data.token as string;

    const createCommentResponse = await request(app)
      .post(`/posts/${postDummies.post1Document._id}/comments`)
      .auth(authToken, { type: "bearer" })
      .send({
        body: "Test comment",
      });
    expect(createCommentResponse.status).toBe(200);

    const commentsResponse = await request(app).get(
      `/posts/${postDummies.post1Document._id}/comments`
    );
    expect(commentsResponse.status).toBe(200);
    expect(
      (commentsResponse.body.data.comments as { body: string }[]).find(
        (comment) => comment.body === "Test comment"
      )
    ).toBeDefined();
  });
});
