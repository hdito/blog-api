import { User } from "../models/user";
import { Env } from "./env";
import jwt from "jsonwebtoken";
import { SupportedRole } from "./supportedRoles";

class MockUser {
  password;
  role: SupportedRole;
  username;
  displayName;
  email;
  document;
  token?: string;

  constructor() {
    this.password = "Password9";
    this.role = "user";
    this.username = "Mock user";
    this.displayName = "Mock user";
    this.email = "mockuser@gmail.com";
    this.document = new User({
      password: this.password,
      role: this.role,
      username: this.username,
      displayName: this.displayName,
      email: this.email,
    });
  }

  addToDb() {
    return this.document.save();
  }

  async setToken() {
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign(
        {
          id: this.document._id,
          displayName: this.document.displayName,
          role: this.document.role,
        },
        Env.JWT_SECRET,
        (err: Error | null, token: string | undefined) => {
          if (err) {
            return reject(err);
          }
          return resolve(token!);
        }
      );
    });
    this.token = token;
  }
}

export const mockUser = new MockUser();
