import { Schema, model } from "mongoose";

const PostSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  content: { type: String, required: false },
  createdAt: { type: Date, default: Date.now() },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isPublished: { type: Boolean, default: false },
});

export const Post = model("Post", PostSchema);
