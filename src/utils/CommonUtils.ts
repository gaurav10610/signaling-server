import { v4 as uuid } from "uuid";

export class CommonUtils {

  /**
   * remove an element from specified array
   * @param array 
   * @param element
   * 
   * @returns 
   */
  static removeArrayElement(array: any[], element: any) {
    const index = array.indexOf(element);
    if (index > -1) {
      array.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

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
