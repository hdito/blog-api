import { ValidationError } from "express-validator";

type Error =
  | {
      message: string;
      path: string;
    }
  | Error[];

export function formatErrors(error: ValidationError): Error {
  switch (error.type) {
    case "field":
      return { message: error.msg, path: error.path };
    case "alternative":
      return error.nestedErrors.map((error) => formatErrors(error));

    default:
      throw Error("Invalid error type");
  }
}
