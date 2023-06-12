import { User } from "../models/user";

type User = {
  username: string;
  displayName: string;
  email: string;
  password: string;
  role: "admin" | "author" | "user";
};

class UserDummies {
  admin: User;
  author: User;
  user: User;
  adminDocument;
  authorDocument;
  userDocument;

  constructor() {
    this.admin = {
      username: "Admin user",
      displayName: "Admin user",
      email: "admin@mail.com",
      password: "Password1",
      role: "admin",
    };
    this.author = {
      username: "Author user",
      displayName: "Author user",
      email: "author@mail.com",
      password: "Password2",
      role: "author",
    };
    this.user = {
      username: "Basic user",
      displayName: "Basic user",
      email: "user@mail.com",
      password: "Password3",
      role: "user",
    };
    this.adminDocument = new User(this.admin);
    this.authorDocument = new User(this.author);
    this.userDocument = new User(this.user);
  }

  addToDb() {
    return Promise.all([
      this.adminDocument.save(),
      this.authorDocument.save(),
      this.userDocument.save(),
    ]);
  }
}

export const userDummies = new UserDummies();
