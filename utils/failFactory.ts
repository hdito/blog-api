import { status } from "./status";

export function failFactory<T>(payload: T) {
  return { status: status.fail, data: payload };
}
