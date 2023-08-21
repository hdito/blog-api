import { status } from "./status";
export function errorFactory(message: string) {
  return { status: status.error, message };
}
