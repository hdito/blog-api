import express from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { initializeMongoTest } from "../../utils/initializeMongoTest";
import { mockAdmin } from "../../utils/mockAdmin";
import { userDummies } from "../../utils/userDummies";
import usersController from "../usersController";
import { mockUser } from "../../utils/mockUser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", usersController);

describe("usersController", () => {
  beforeAll(async () => {
    await initializeMongoTest();

    await mockAdmin.addToDb();
    await mockAdmin.setToken();

    await userDummies.addToDb();

    await mockUser.addToDb();
    await mockUser.setToken();
  });

  it("Sends list of users from db", async () => {
    const usersResponse = await request(app)
      .get("/")
      .auth(mockAdmin.token!, { type: "bearer" });
    expect(usersResponse.status).toBe(200);
    expect(usersResponse.body.data.users).instanceOf(Array);
  });

  it("Allows admin to change user's role", async () => {
    const userResponse = await request(app)
      .get(`/${userDummies.userDocument._id}`)
      .auth(mockAdmin.token!, { type: "bearer" });
    expect(userResponse.body.data.user.role).toBe("user");

    const patchUserResponse = await request(app)
      .patch(`/${userDummies.userDocument._id}`)
      .send({
        role: "author",
      })
      .auth(mockAdmin.token!, { type: "bearer" });
    expect(patchUserResponse.status).toBe(200);

    const updatedUserResponse = await request(app)
      .get(`/${userDummies.userDocument._id}`)
      .auth(mockAdmin.token!, { type: "bearer" });
    expect(updatedUserResponse.body.data.user.role).toBe("author");
  });
  it("Guards patching users from unauthorized requests", async () => {
    const authorResponse = await request(app)
      .get(`/${userDummies.authorDocument._id}`)
      .auth(mockAdmin.token!, { type: "bearer" });
    expect(authorResponse.body.data.user.role).toBe("author");

    const patchAuthorByUserResponse = await request(app)
      .patch(`/${userDummies.userDocument._id}`)
      .send({
        role: "author",
      })
      .auth(mockUser.token!, { type: "bearer" });
    expect(patchAuthorByUserResponse.status).toBe(403);

    const patchAuthorResponse = await request(app)
      .patch(`/${userDummies.userDocument._id}`)
      .send({
        role: "author",
      });
    expect(patchAuthorResponse.status).toBe(401);
  });
});
