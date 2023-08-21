import { Schema, model } from "mongoose";

const CommentSchema = new Schema(
  {
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = model("Comment", CommentSchema);
