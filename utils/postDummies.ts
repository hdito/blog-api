import { Post } from "../models/post";
import { userDummies } from "./userDummies";

class PostDummies {
  post1;
  post2;
  post3;
  post1Document;
  post2Document;
  post3Document;

  constructor() {
    this.post1 = {
      title: "First post",
      isPublished: true,
      author: userDummies.authorDocument._id,
    };
    this.post2 = {
      title: "Second post",
      isPublished: true,
      author: userDummies.authorDocument._id,
    };
    this.post3 = {
      title: "Third post",
      isPublished: true,
      author: userDummies.authorDocument._id,
    };
    this.post1Document = new Post(this.post1);
    this.post2Document = new Post(this.post2);
    this.post3Document = new Post(this.post3);
  }

  addToDb() {
    return Promise.all([
      this.post1Document.save(),
      this.post2Document.save(),
      this.post3Document.save(),
    ]);
  }
}

export const postDummies = new PostDummies();
