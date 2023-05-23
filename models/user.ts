import { CallbackError, Schema, model } from "mongoose";
import { hash } from "bcryptjs";

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["author", "admin", "user"], required: true },
});

UserSchema.pre("save", async function (next) {
  if (!this.isNew) {
    next();
  }
  try {
    const hashedPassword = await hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

export const User = model("User", UserSchema);
