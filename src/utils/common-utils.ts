import { v4 as uuid } from "uuid";

export class CommonUtils {
  static generateUniqueId(): string {
    return uuid();
  }
}
