import { CallbackError, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    set: (value: string) => value.toLowerCase(),
  },
  displayName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    set: (value: string) => value.toLowerCase(),
  },
  password: { type: String, required: true },
  role: { type: String, enum: ["author", "admin", "user"], required: true },
});

UserSchema.pre("save", async function (next) {
  if (!this.isNew) {
    next();
  }
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

export const User = model("User", UserSchema);
