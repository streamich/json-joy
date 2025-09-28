/**
 * JSONPath parser implementation based on RFC 9535
 * https://www.rfc-editor.org/rfc/rfc9535.html
 */

import {Parser} from './Parser';
import type * as types from './types';

export class JsonPathParser extends Parser {
  /**
   * Parse a JSONPath expression string
   *
   * @param pathStr - JSONPath expression string (e.g., "$.store.book[0].title").
   * @returns Parse result with structured representation or error information.
   */
  public static parse = (pathStr: string): types.ParseResult =>
    new JsonPathParser().parse(pathStr);
  

  /**
   * Parse a JSONPath expression string into a structured representation
   */
  parse(pathStr: string): types.ParseResult {
    try {
      this.reset(pathStr);
      const path = this.parseJSONPath();
      return {
        success: true,
        path,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        position: this.pos,
      };
    }
  }

  private parseJSONPath(): types.JSONPath {
    const segments: types.PathSegment[] = [];

    // Root path starts with $
    this.ws();
    if (!this.is('$')) {
      throw new Error('JSONPath must start with $');
    }
    this.skip(1); // Skip $
    this.ws(); // Skip whitespace after $

    // Parse segments
    while (!this.eof()) {
      this.ws();
      if (this.eof()) break;

      const segment = this.parsePathSegment();
      segments.push(segment);
    }

    return {segments};
  }

  private parsePathSegment(): types.PathSegment {
    this.ws();

    // Check for recursive descent (..)
    const recursive = this.is('..') as boolean;
    if (recursive) {
      this.skip(2); // Skip ..
      // After .., we should have a selector without requiring . or [
      if (this.eof()) {
        throw new Error('Expected selector after ..');
      }
    }

    // Parse selectors
    const selectors: types.AnySelector[] = [];

    // Handle different selector formats
    if (this.is('.')) {
      // Dot notation: .name, .*, etc.
      this.skip(1); // Skip .
      this.ws(); // Skip whitespace after .

      if (this.is('*')) {
        // Wildcard
        this.skip(1);
        selectors.push({type: 'wildcard'} as types.WildcardSelector);
      } else {
        // Named selector
        const name = this.parseIdentifier();
        selectors.push({type: 'name', name} as types.NamedSelector);
      }
    } else if (this.is('[')) {
      // Bracket notation: [index], ['name'], [*], [start:end], etc.
      this.skip(1); // Skip [
      this.ws();

      if (this.is('*')) {
        // Wildcard
        this.skip(1);
        selectors.push({type: 'wildcard'} as types.WildcardSelector);
      } else if (this.is('?')) {
        // Filter expression - simplified implementation for now
        this.skip(1); // Skip ?
        this.ws();
        if (!this.is('(')) {
          throw new Error('Expected ( after ?');
        }

        // For now, just parse the entire filter as one block
        let parenCount = 0;
        const start = this.pos;
        while (!this.eof()) {
          const char = this.peek() as string;
          if (char === '(') {
            parenCount++;
          } else if (char === ')') {
            parenCount--;
            if (parenCount === 0) {
              this.skip(1); // Skip final )
              break;
            }
          }
          this.skip(1);
        }

        if (parenCount > 0) {
          throw new Error('Expected ) to close filter expression');
        }

        // Create a simple filter expression
        const expression: types.FilterExpression = {
          type: 'existence',
          path: {segments: []},
        } as types.ExistenceExpression;

        selectors.push({type: 'filter', expression} as types.FilterSelector);
      } else if (this.is("'") || this.is('"')) {
        // Quoted string selector
        const name = this.parseString();
        selectors.push({type: 'name', name} as types.NamedSelector);
      } else {
        // Number or slice
        let first: number | undefined;
        if (!this.is(':')) {
          first = this.parseNumber();
          this.ws();
        }

        if (this.is(':')) {
          // Slice selector
          this.skip(1); // Skip :
          this.ws();

          let end: number | undefined;
          let step: number | undefined;

          if (!this.is(']') && !this.is(':')) {
            end = this.parseNumber();
            this.ws();
          }

          if (this.is(':')) {
            this.skip(1); // Skip :
            this.ws();
            if (!this.is(']')) {
              step = this.parseNumber();
            }
          }

          selectors.push({
            type: 'slice',
            start: first,
            end,
            step,
          } as types.SliceSelector);
        } else {
          // Index selector
          if (first === undefined) {
            throw new Error('Expected index or slice');
          }
          selectors.push({type: 'index', index: first} as types.IndexSelector);
        }
      }

      this.ws();
      if (!this.is(']')) {
        throw new Error('Expected ] to close bracket selector');
      }
      this.skip(1); // Skip ]
    } else if (recursive && this.match(/[a-zA-Z_*]/)) {
      // After recursive descent, we can have an identifier or wildcard
      if (this.is('*')) {
        this.skip(1);
        selectors.push({type: 'wildcard'} as types.WildcardSelector);
      } else {
        const name = this.parseIdentifier();
        selectors.push({type: 'name', name} as types.NamedSelector);
      }
    } else {
      throw new Error('Expected . or [ to start path segment');
    }

    if (recursive && selectors.length === 1) {
      return {
        selectors: [
          {
            type: 'recursive-descent',
            selector: selectors[0],
          } as types.RecursiveDescentSelector,
        ],
      };
    }

    return {selectors, recursive: recursive || undefined};
  }

  private parseFilterExpression(): types.FilterExpression {
    return this.parseLogicalOrExpression();
  }

  private parseLogicalOrExpression(): types.FilterExpression {
    let left = this.parseLogicalAndExpression();

    while (this.is('||')) {
      this.skip(2);
      this.ws();
      const right = this.parseLogicalAndExpression();
      left = {
        type: 'logical',
        operator: '||',
        left,
        right,
      } as types.LogicalExpression;
    }

    return left;
  }

  private parseLogicalAndExpression(): types.FilterExpression {
    let left = this.parseComparisonExpression();

    while (this.is('&&')) {
      this.skip(2);
      this.ws();
      const right = this.parseComparisonExpression();
      left = {
        type: 'logical',
        operator: '&&',
        left,
        right,
      } as types.LogicalExpression;
    }

    return left;
  }

  private parseComparisonExpression(): types.FilterExpression {
    const left = this.parseValueExpression();
    this.ws();

    // Check for comparison operators
    if (this.is('==')) {
      this.skip(2);
      this.ws();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '==',
        left,
        right,
      } as types.ComparisonExpression;
    } else if (this.is('!=')) {
      this.skip(2);
      this.ws();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '!=',
        left,
        right,
      } as types.ComparisonExpression;
    } else if (this.is('<=')) {
      this.skip(2);
      this.ws();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '<=',
        left,
        right,
      } as types.ComparisonExpression;
    } else if (this.is('>=')) {
      this.skip(2);
      this.ws();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '>=',
        left,
        right,
      } as types.ComparisonExpression;
    } else if (this.is('<')) {
      this.skip(1);
      this.ws();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '<',
        left,
        right,
      } as types.ComparisonExpression;
    } else if (this.is('>')) {
      this.skip(1);
      this.ws();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '>',
        left,
        right,
      } as types.ComparisonExpression;
    }

    // If no comparison operator, treat as existence test
    return {
      type: 'existence',
      path: {segments: []}, // This would need the path from the left expression
    } as types.ExistenceExpression;
  }

  private parseValueExpression(): types.ValueExpression {
    this.ws();

    if (this.is('@')) {
      // Current node
      this.skip(1);

      if (this.is('.') || this.is('[')) {
        // Path from current node
        const pathStr = this.parseRelativePath();
        return {
          type: 'path',
          path: this.parse('@' + pathStr).path!,
        } as types.PathExpression;
      }

      return {type: 'current'} as types.CurrentNodeExpression;
    } else if (this.is('$')) {
      // Root node path
      const pathStr = this.parseRelativePath();
      return {
        type: 'path',
        path: this.parse('$' + pathStr).path!,
      } as types.PathExpression;
    } else if (this.is("'") || this.is('"')) {
      // String literal
      const value = this.parseString();
      return {
        type: 'literal',
        value,
      } as types.LiteralExpression;
    } else if (this.match(/[0-9-]/)) {
      // Number literal
      const value = this.parseNumber();
      return {
        type: 'literal',
        value,
      } as types.LiteralExpression;
    } else if (this.is('true')) {
      this.skip(4);
      return {
        type: 'literal',
        value: true,
      } as types.LiteralExpression;
    } else if (this.is('false')) {
      this.skip(5);
      return {
        type: 'literal',
        value: false,
      } as types.LiteralExpression;
    } else if (this.is('null')) {
      this.skip(4);
      return {
        type: 'literal',
        value: null,
      } as types.LiteralExpression;
    }

    throw new Error('Expected value expression');
  }

  private parseRelativePath(): string {
    const start = this.pos;
    let depth = 0;

    while (!this.eof()) {
      const char = this.peek() as string;
      if (char === '[') {
        depth++;
      } else if (char === ']') {
        depth--;
        if (depth < 0) break;
      } else if (char === ')' && depth === 0) {
        break;
      } else if (/\s/.test(char) && depth === 0) {
        break;
      }
      this.skip(1);
    }

    return this.str.slice(start, this.pos);
  }

  private parseIdentifier(): string {
    const start = this.pos;

    if (!this.match(/[a-zA-Z_]/)) {
      throw new Error('Expected identifier');
    }

    while (this.match(/[a-zA-Z0-9_]/)) {
      this.skip(1);
    }

    return this.str.slice(start, this.pos);
  }

  private parseString(): string {
    const quote = this.peek();
    if (quote !== "'" && quote !== '"') {
      throw new Error('Expected string literal');
    }

    this.skip(1); // Skip opening quote
    const start = this.pos;

    while (!this.eof() && !this.is(quote)) {
      if (this.is('\\')) {
        this.skip(2); // Skip escape sequence
      } else {
        this.skip(1);
      }
    }

    if (this.eof()) {
      throw new Error('Unterminated string literal');
    }

    const value = this.str.slice(start, this.pos);
    this.skip(1); // Skip closing quote

    // Process escape sequences
    return value.replace(/\\./g, (match: string) => {
      switch (match[1]) {
        case 'n':
          return '\n';
        case 't':
          return '\t';
        case 'r':
          return '\r';
        case 'b':
          return '\b';
        case 'f':
          return '\f';
        case '\\':
          return '\\';
        case '/':
          return '/';
        case '"':
          return '"';
        case "'":
          return "'";
        default:
          return match;
      }
    });
  }

  private parseNumber(): number {
    const start = this.pos;

    if (this.is('-')) {
      this.skip(1);
    }

    if (!this.match(/[0-9]/)) {
      throw new Error('Expected number');
    }

    if (this.is('0')) {
      this.skip(1);
    } else {
      while (this.match(/[0-9]/)) {
        this.skip(1);
      }
    }

    if (this.is('.')) {
      this.skip(1);
      if (!this.match(/[0-9]/)) {
        throw new Error('Expected digit after decimal point');
      }
      while (this.match(/[0-9]/)) {
        this.skip(1);
      }
    }

    if (this.match(/[eE]/)) {
      this.skip(1);
      if (this.match(/[+-]/)) {
        this.skip(1);
      }
      if (!this.match(/[0-9]/)) {
        throw new Error('Expected digit in exponent');
      }
      while (this.match(/[0-9]/)) {
        this.skip(1);
      }
    }

    const numStr = this.str.slice(start, this.pos);
    return Number.parseFloat(numStr);
  }
}
