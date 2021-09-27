/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export interface DecodedAuthToken {
  header: string;
  JWSPayload: string;
  JWSSig: string;
}
/**
 * @hidden
 */
export class StringUtils {
  /**
   * decode a JWT
   *
   * @param authToken
   */
  static decodeAuthToken(authToken: string): DecodedAuthToken {
    if (StringUtils.isEmpty(authToken)) {
      throw console.error("decodeAuthToken Error, authToken:", authToken);
    }
    const tokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;
    const matches = tokenPartsRegex.exec(authToken);
    if (!matches || matches.length < 4) {
      throw console.error(
        `Given token is malformed: ${JSON.stringify(authToken)}`
      );
    }
    const crackedToken: DecodedAuthToken = {
      header: matches[1],
      JWSPayload: matches[2],
      JWSSig: matches[3],
    };
    return crackedToken;
  }

  /**
   * Check if a string is empty.
   *
   * @param str
   */
  static isEmpty(str?: string): boolean {
    return typeof str === "undefined" || !str || 0 === str.length;
  }

  /**
   * Check if stringified object is empty
   * @param strObj
   */
  static isEmptyObj(strObj?: string): boolean {
    if (strObj && !StringUtils.isEmpty(strObj)) {
      try {
        const obj = JSON.parse(strObj);
        return Object.keys(obj).length === 0;
      } catch (e) {}
    }
    return true;
  }

  static startsWith(str: string, search: string): boolean {
    return str.indexOf(search) === 0;
  }

  static endsWith(str: string, search: string): boolean {
    return (
      str.length >= search.length &&
      str.lastIndexOf(search) === str.length - search.length
    );
  }

  /**
   * Parses string into an object.
   *
   * @param query
   */
  static queryStringToObject<T>(query: string): T {
    let match: Array<string> | null; // Regex for replacing addition symbol with a space
    const pl = /\+/g;
    const search = /([^&=]+)=([^&]*)/g;
    const decode = (s: string): string =>
      decodeURIComponent(decodeURIComponent(s.replace(pl, " ")));
    const obj: {} = {};
    match = search.exec(query);
    while (match) {
      obj[decode(match[1])] = decode(match[2]);
      match = search.exec(query);
    }
    return obj as T;
  }

  /**
   * Trims entries in an array.
   *
   * @param arr
   */
  static trimArrayEntries(arr: Array<string>): Array<string> {
    return arr.map((entry) => entry.trim());
  }

  /**
   * Removes empty strings from array
   * @param arr
   */
  static removeEmptyStringsFromArray(arr: Array<string>): Array<string> {
    return arr.filter((entry) => {
      return !StringUtils.isEmpty(entry);
    });
  }

  /**
   * Attempts to parse a string into JSON
   * @param str
   */
  static jsonParseHelper<T>(str: string): T | null {
    try {
      return JSON.parse(str) as T;
    } catch (e) {
      return null;
    }
  }

  /**
   * Tests if a given string matches a given pattern, with support for wildcards and queries.
   * @param pattern Wildcard pattern to string match. Supports "*" for wildcards and "?" for queries
   * @param input String to match against
   */
  static matchPattern(pattern: string, input: string): boolean {
    /**
     * Wildcard support: https://stackoverflow.com/a/3117248/4888559
     * Queries: replaces "?" in string with escaped "\?" for regex test
     */
    const regex: RegExp = new RegExp(
      pattern.replace(/\*/g, "[^ ]*").replace(/\?/g, "\\?")
    );

    return regex.test(input);
  }
}
