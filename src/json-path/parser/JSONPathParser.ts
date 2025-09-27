/**
 * JSONPath parser implementation based on RFC 9535
 * https://www.rfc-editor.org/rfc/rfc9535.html
 */

import type {
  JSONPath,
  PathSegment,
  AnySelector,
  NamedSelector,
  IndexSelector,
  SliceSelector,
  WildcardSelector,
  RecursiveDescentSelector,
  FilterSelector,
  ParseResult,
  FilterExpression,
  ComparisonExpression,
  LogicalExpression,
  ExistenceExpression,
  ValueExpression,
  CurrentNodeExpression,
  RootNodeExpression,
  LiteralExpression,
  PathExpression,
} from '../types';

/**
 * Simple parser for JSONPath strings
 */
class SimpleParser {
  public input: string;
  public pos: number;

  constructor() {
    this.input = '';
    this.pos = 0;
  }

  reset(input: string): void {
    this.input = input;
    this.pos = 0;
  }

  eof(): boolean {
    return this.pos >= this.input.length;
  }

  peek(expected?: string | RegExp | number): string | boolean {
    if (typeof expected === 'number') {
      // Peek n characters
      return this.input.substring(this.pos, this.pos + expected) || '';
    }

    if (this.eof()) return '';

    if (expected === undefined) {
      return this.input[this.pos];
    }

    if (typeof expected === 'string') {
      return this.input.substring(this.pos, this.pos + expected.length) === expected;
    }

    if (expected instanceof RegExp) {
      return expected.test(this.input[this.pos]);
    }

    return false;
  }

  skip(count: number): void {
    this.pos += count;
  }

  skipWhitespace(): void {
    while (!this.eof() && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }
}

export class JSONPathParser {
  private parser: SimpleParser;

  constructor() {
    this.parser = new SimpleParser();
  }

  /**
   * Parse a JSONPath expression string into a structured representation
   */
  parse(pathStr: string): ParseResult {
    try {
      this.parser.reset(pathStr);
      const path = this.parseJSONPath();
      return {
        success: true,
        path,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        position: this.parser.pos,
      };
    }
  }

  private parseJSONPath(): JSONPath {
    const segments: PathSegment[] = [];

    // Root path starts with $
    this.parser.skipWhitespace();
    if (!this.parser.peek('$')) {
      throw new Error('JSONPath must start with $');
    }
    this.parser.skip(1); // Skip $
    this.parser.skipWhitespace(); // Skip whitespace after $

    // Parse segments
    while (!this.parser.eof()) {
      this.parser.skipWhitespace();
      if (this.parser.eof()) break;

      const segment = this.parsePathSegment();
      segments.push(segment);
    }

    return {segments};
  }

  private parsePathSegment(): PathSegment {
    this.parser.skipWhitespace();

    // Check for recursive descent (..)
    const recursive = this.parser.peek('..') as boolean;
    if (recursive) {
      this.parser.skip(2); // Skip ..
      // After .., we should have a selector without requiring . or [
      if (this.parser.eof()) {
        throw new Error('Expected selector after ..');
      }
    }

    // Parse selectors
    const selectors: AnySelector[] = [];

    // Handle different selector formats
    if (this.parser.peek('.')) {
      // Dot notation: .name, .*, etc.
      this.parser.skip(1); // Skip .
      this.parser.skipWhitespace(); // Skip whitespace after .

      if (this.parser.peek('*')) {
        // Wildcard
        this.parser.skip(1);
        selectors.push({type: 'wildcard'} as WildcardSelector);
      } else {
        // Named selector
        const name = this.parseIdentifier();
        selectors.push({type: 'name', name} as NamedSelector);
      }
    } else if (this.parser.peek('[')) {
      // Bracket notation: [index], ['name'], [*], [start:end], etc.
      this.parser.skip(1); // Skip [
      this.parser.skipWhitespace();

      if (this.parser.peek('*')) {
        // Wildcard
        this.parser.skip(1);
        selectors.push({type: 'wildcard'} as WildcardSelector);
      } else if (this.parser.peek('?')) {
        // Filter expression - simplified implementation for now
        this.parser.skip(1); // Skip ?
        this.parser.skipWhitespace();
        if (!this.parser.peek('(')) {
          throw new Error('Expected ( after ?');
        }

        // For now, just parse the entire filter as one block
        let parenCount = 0;
        const start = this.parser.pos;
        while (!this.parser.eof()) {
          const char = this.parser.peek() as string;
          if (char === '(') {
            parenCount++;
          } else if (char === ')') {
            parenCount--;
            if (parenCount === 0) {
              this.parser.skip(1); // Skip final )
              break;
            }
          }
          this.parser.skip(1);
        }

        if (parenCount > 0) {
          throw new Error('Expected ) to close filter expression');
        }

        // Create a simple filter expression
        const expression: FilterExpression = {
          type: 'existence',
          path: {segments: []},
        } as ExistenceExpression;

        selectors.push({type: 'filter', expression} as FilterSelector);
      } else if (this.parser.peek("'") || this.parser.peek('"')) {
        // Quoted string selector
        const name = this.parseString();
        selectors.push({type: 'name', name} as NamedSelector);
      } else {
        // Number or slice
        let first: number | undefined;
        if (!this.parser.peek(':')) {
          first = this.parseNumber();
          this.parser.skipWhitespace();
        }

        if (this.parser.peek(':')) {
          // Slice selector
          this.parser.skip(1); // Skip :
          this.parser.skipWhitespace();

          let end: number | undefined;
          let step: number | undefined;

          if (!this.parser.peek(']') && !this.parser.peek(':')) {
            end = this.parseNumber();
            this.parser.skipWhitespace();
          }

          if (this.parser.peek(':')) {
            this.parser.skip(1); // Skip :
            this.parser.skipWhitespace();
            if (!this.parser.peek(']')) {
              step = this.parseNumber();
            }
          }

          selectors.push({
            type: 'slice',
            start: first,
            end,
            step,
          } as SliceSelector);
        } else {
          // Index selector
          if (first === undefined) {
            throw new Error('Expected index or slice');
          }
          selectors.push({type: 'index', index: first} as IndexSelector);
        }
      }

      this.parser.skipWhitespace();
      if (!this.parser.peek(']')) {
        throw new Error('Expected ] to close bracket selector');
      }
      this.parser.skip(1); // Skip ]
    } else if (recursive && this.parser.peek(/[a-zA-Z_*]/)) {
      // After recursive descent, we can have an identifier or wildcard
      if (this.parser.peek('*')) {
        this.parser.skip(1);
        selectors.push({type: 'wildcard'} as WildcardSelector);
      } else {
        const name = this.parseIdentifier();
        selectors.push({type: 'name', name} as NamedSelector);
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
          } as RecursiveDescentSelector,
        ],
      };
    }

    return {selectors, recursive: recursive || undefined};
  }

  private parseFilterExpression(): FilterExpression {
    return this.parseLogicalOrExpression();
  }

  private parseLogicalOrExpression(): FilterExpression {
    let left = this.parseLogicalAndExpression();

    while (this.parser.peek('||')) {
      this.parser.skip(2);
      this.parser.skipWhitespace();
      const right = this.parseLogicalAndExpression();
      left = {
        type: 'logical',
        operator: '||',
        left,
        right,
      } as LogicalExpression;
    }

    return left;
  }

  private parseLogicalAndExpression(): FilterExpression {
    let left = this.parseComparisonExpression();

    while (this.parser.peek('&&')) {
      this.parser.skip(2);
      this.parser.skipWhitespace();
      const right = this.parseComparisonExpression();
      left = {
        type: 'logical',
        operator: '&&',
        left,
        right,
      } as LogicalExpression;
    }

    return left;
  }

  private parseComparisonExpression(): FilterExpression {
    const left = this.parseValueExpression();
    this.parser.skipWhitespace();

    // Check for comparison operators
    if (this.parser.peek('==')) {
      this.parser.skip(2);
      this.parser.skipWhitespace();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '==',
        left,
        right,
      } as ComparisonExpression;
    } else if (this.parser.peek('!=')) {
      this.parser.skip(2);
      this.parser.skipWhitespace();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '!=',
        left,
        right,
      } as ComparisonExpression;
    } else if (this.parser.peek('<=')) {
      this.parser.skip(2);
      this.parser.skipWhitespace();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '<=',
        left,
        right,
      } as ComparisonExpression;
    } else if (this.parser.peek('>=')) {
      this.parser.skip(2);
      this.parser.skipWhitespace();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '>=',
        left,
        right,
      } as ComparisonExpression;
    } else if (this.parser.peek('<')) {
      this.parser.skip(1);
      this.parser.skipWhitespace();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '<',
        left,
        right,
      } as ComparisonExpression;
    } else if (this.parser.peek('>')) {
      this.parser.skip(1);
      this.parser.skipWhitespace();
      const right = this.parseValueExpression();
      return {
        type: 'comparison',
        operator: '>',
        left,
        right,
      } as ComparisonExpression;
    }

    // If no comparison operator, treat as existence test
    return {
      type: 'existence',
      path: {segments: []}, // This would need the path from the left expression
    } as ExistenceExpression;
  }

  private parseValueExpression(): ValueExpression {
    this.parser.skipWhitespace();

    if (this.parser.peek('@')) {
      // Current node
      this.parser.skip(1);

      if (this.parser.peek('.') || this.parser.peek('[')) {
        // Path from current node
        const pathStr = this.parseRelativePath();
        return {
          type: 'path',
          path: this.parse('@' + pathStr).path!,
        } as PathExpression;
      }

      return {type: 'current'} as CurrentNodeExpression;
    } else if (this.parser.peek('$')) {
      // Root node path
      const pathStr = this.parseRelativePath();
      return {
        type: 'path',
        path: this.parse('$' + pathStr).path!,
      } as PathExpression;
    } else if (this.parser.peek("'") || this.parser.peek('"')) {
      // String literal
      const value = this.parseString();
      return {
        type: 'literal',
        value,
      } as LiteralExpression;
    } else if (this.parser.peek(/[0-9-]/)) {
      // Number literal
      const value = this.parseNumber();
      return {
        type: 'literal',
        value,
      } as LiteralExpression;
    } else if (this.parser.peek('true')) {
      this.parser.skip(4);
      return {
        type: 'literal',
        value: true,
      } as LiteralExpression;
    } else if (this.parser.peek('false')) {
      this.parser.skip(5);
      return {
        type: 'literal',
        value: false,
      } as LiteralExpression;
    } else if (this.parser.peek('null')) {
      this.parser.skip(4);
      return {
        type: 'literal',
        value: null,
      } as LiteralExpression;
    }

    throw new Error('Expected value expression');
  }

  private parseRelativePath(): string {
    const start = this.parser.pos;
    let depth = 0;

    while (!this.parser.eof()) {
      const char = this.parser.peek() as string;
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
      this.parser.skip(1);
    }

    return this.parser.input.slice(start, this.parser.pos);
  }

  private parseIdentifier(): string {
    const start = this.parser.pos;

    if (!this.parser.peek(/[a-zA-Z_]/)) {
      throw new Error('Expected identifier');
    }

    while (this.parser.peek(/[a-zA-Z0-9_]/)) {
      this.parser.skip(1);
    }

    return this.parser.input.slice(start, this.parser.pos);
  }

  private parseString(): string {
    const quote = this.parser.peek();
    if (quote !== "'" && quote !== '"') {
      throw new Error('Expected string literal');
    }

    this.parser.skip(1); // Skip opening quote
    const start = this.parser.pos;

    while (!this.parser.eof() && !this.parser.peek(quote)) {
      if (this.parser.peek('\\')) {
        this.parser.skip(2); // Skip escape sequence
      } else {
        this.parser.skip(1);
      }
    }

    if (this.parser.eof()) {
      throw new Error('Unterminated string literal');
    }

    const value = this.parser.input.slice(start, this.parser.pos);
    this.parser.skip(1); // Skip closing quote

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
    const start = this.parser.pos;

    if (this.parser.peek('-')) {
      this.parser.skip(1);
    }

    if (!this.parser.peek(/[0-9]/)) {
      throw new Error('Expected number');
    }

    if (this.parser.peek('0')) {
      this.parser.skip(1);
    } else {
      while (this.parser.peek(/[0-9]/)) {
        this.parser.skip(1);
      }
    }

    if (this.parser.peek('.')) {
      this.parser.skip(1);
      if (!this.parser.peek(/[0-9]/)) {
        throw new Error('Expected digit after decimal point');
      }
      while (this.parser.peek(/[0-9]/)) {
        this.parser.skip(1);
      }
    }

    if (this.parser.peek(/[eE]/)) {
      this.parser.skip(1);
      if (this.parser.peek(/[+-]/)) {
        this.parser.skip(1);
      }
      if (!this.parser.peek(/[0-9]/)) {
        throw new Error('Expected digit in exponent');
      }
      while (this.parser.peek(/[0-9]/)) {
        this.parser.skip(1);
      }
    }

    const numStr = this.parser.input.slice(start, this.parser.pos);
    return Number.parseFloat(numStr);
  }
}
