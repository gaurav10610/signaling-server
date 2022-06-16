import { v4 as uuid } from "uuid";

export class CommonUtils {

  /**
   * generate unique id
   * @returns 
   */
  static generateUniqueId(): string {
    return uuid();
  }

  /**
   * check if value contains the specified prefix
   * @param prefix
   * @param value
   * @returns
   */
  static checkPrefix(prefix: string, value: string): boolean {
    return value.length >= prefix.length && value.includes(prefix);
  }
}
