import { status } from "./status";

export function successFactory<T>(payload?: T) {
  return { status: status.success, data: payload ? payload : null };
}
