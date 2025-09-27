/**
 * JSONPath parser and types
 *
 * Implementation of JSONPath specification RFC 9535
 * https://www.rfc-editor.org/rfc/rfc9535.html
 */

export * from './types';
export * from './parser/JSONPathParser';
export * from './util';

import {JSONPathParser} from './parser/JSONPathParser';
import type {ParseResult} from './types';

/**
 * Parse a JSONPath expression string
 * @param pathStr - JSONPath expression string (e.g., "$.store.book[0].title")
 * @returns Parse result with structured representation or error information
 */
export function parseJSONPath(pathStr: string): ParseResult {
  const parser = new JSONPathParser();
  return parser.parse(pathStr);
}
