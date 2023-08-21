import { ValidationError } from "express-validator";

export function formatErrors(error: ValidationError) {
  switch (error.type) {
    case "field":
      return { message: error.msg, path: error.path };

    default:
      throw Error("Invalid error type");
  }
}
