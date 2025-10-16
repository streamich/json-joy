/**
 * JSONPath parser implementation based on RFC 9535
 * https://www.rfc-editor.org/rfc/rfc9535.html
 */

import {Parser} from './Parser';
import {Ast} from './ast';
import type * as types from './types';

export class JsonPathParser extends Parser {
  /**
   * Parse a JSONPath expression string
   *
   * @param pathStr - JSONPath expression string (e.g., "$.store.book[0].title").
   * @returns Parse result with structured representation or error information.
   */
  public static parse = (pathStr: string): types.ParseResult => new JsonPathParser().parse(pathStr);

  /**
   * Parse a JSONPath expression string into a structured representation
   */
  parse(pathStr: string): types.ParseResult {
    try {
      this.reset(pathStr);
      const path = this.parseJSONPath();
      return {success: true, path};
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

    return Ast.path(segments);
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
        selectors.push(Ast.selector.wildcard());
      } else {
        // Named selector
        const name = this.parseIdentifier();
        selectors.push(Ast.selector.named(name));
      }
    } else if (this.is('[')) {
      // Bracket notation: [index], ['name'], [*], [start:end], [a,b,c] etc.
      this.skip(1); // Skip [
      this.ws();

      // Parse comma-separated list of selectors
      do {
        this.ws();
        const selector = this.parseBracketSelector();
        selectors.push(selector);
        this.ws();

        // Check for comma to continue, or ] to end
        if (this.is(',')) {
          this.skip(1); // Skip comma
          this.ws();
        } else {
          break;
        }
      } while (!this.eof() && !this.is(']'));

      this.ws();
      if (!this.is(']')) {
        throw new Error('Expected ] to close bracket selector');
      }
      this.skip(1); // Skip ]
    } else if (recursive && this.match(/[a-zA-Z_*]/)) {
      // After recursive descent, we can have an identifier or wildcard
      if (this.is('*')) {
        this.skip(1);
        selectors.push(Ast.selector.wildcard());
      } else {
        const name = this.parseIdentifier();
        selectors.push(Ast.selector.named(name));
      }
    } else {
      throw new Error('Expected . or [ to start path segment');
    }

    if (recursive && selectors.length === 1) {
      return Ast.segment([Ast.selector.recursiveDescent(selectors[0])]);
    }

    return Ast.segment(selectors, recursive || undefined);
  }

  private parseBracketSelector(): types.AnySelector {
    this.ws();

    if (this.is('*')) {
      // Wildcard
      this.skip(1);
      return Ast.selector.wildcard();
    } else if (this.is('?')) {
      // Filter expression
      this.skip(1); // Skip ?
      this.ws();

      // Parentheses are optional according to RFC 9535, but commonly used
      let hasParens = false;
      if (this.is('(')) {
        hasParens = true;
        this.skip(1);
        this.ws();
      }

      const expression = this.parseFilterExpression();

      if (hasParens) {
        this.ws();
        if (!this.is(')')) {
          throw new Error('Expected ) to close filter expression');
        }
        this.skip(1);
      }

      return Ast.selector.filter(expression);
    } else if (this.is("'") || this.is('"')) {
      // Quoted string selector
      const name = this.parseString();
      return Ast.selector.named(name);
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

        if (!this.is(']') && !this.is(':') && !this.is(',')) {
          end = this.parseNumber();
          this.ws();
        }

        if (this.is(':')) {
          this.skip(1); // Skip :
          this.ws();
          if (!this.is(']') && !this.is(',')) {
            step = this.parseNumber();
          }
        }

        return Ast.selector.slice(first, end, step);
      } else {
        // Index selector
        if (first === undefined) {
          throw new Error('Expected index or slice');
        }
        return Ast.selector.index(first);
      }
    }
  }

  private parseFilterExpression(): types.FilterExpression {
    return this.parseLogicalOrExpression();
  }

  private parseLogicalOrExpression(): types.FilterExpression {
    let left = this.parseLogicalAndExpression();
    this.ws();

    while (this.is('||')) {
      this.skip(2);
      this.ws();
      const right = this.parseLogicalAndExpression();
      left = Ast.expression.logical('||', left, right);
      this.ws();
    }

    return left;
  }

  private parseLogicalAndExpression(): types.FilterExpression {
    let left = this.parseComparisonExpression();
    this.ws();

    while (this.is('&&')) {
      this.skip(2);
      this.ws();
      const right = this.parseComparisonExpression();
      left = Ast.expression.logical('&&', left, right);
      this.ws();
    }

    return left;
  }

  private parseComparisonExpression(): types.FilterExpression {
    return this.parseUnaryExpression();
  }

  private parseUnaryExpression(): types.FilterExpression {
    this.ws();
    if (this.is('!')) {
      // Handle logical NOT operator
      this.skip(1);
      this.ws();
      const expression = this.parseUnaryExpression();
      return Ast.expression.negation(expression);
    }
    if (this.is('(')) {
      // Handle parenthesized expressions
      this.skip(1);
      this.ws();
      const expression = this.parseFilterExpression();
      this.ws();
      if (!this.is(')')) {
        throw new Error('Expected ) to close parenthesized expression');
      }
      this.skip(1);
      return Ast.expression.paren(expression);
    }
    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): types.FilterExpression {
    const left = this.parseValueExpression();
    this.ws();
    if (this.isComparisonOperator()) {
      const operator = this.parseComparisonOperator();
      this.ws();
      const right = this.parseValueExpression();
      return Ast.expression.comparison(operator, left, right);
    }
    // If no comparison operator, this is an existence test
    if (left.type === 'path') {
      return Ast.expression.existence(left.path);
    } else if (left.type === 'current') {
      // @  by itself is an existence test for current node
      return Ast.expression.existence(Ast.path([]));
    } else if (left.type === 'function') {
      // Function expressions can be used as test expressions (e.g., $[?match(@.name, "pattern")])
      return left as types.FilterExpression;
    }
    // If no comparison operator, treat as existence test
    return Ast.expression.existence(Ast.path([])); // TODO: implement proper existence test with the path
  }

  private parseFunctionName(): string {
    const start = this.pos;
    if (!this.match(/[a-z]/)) throw new Error('Expected function name');
    while (this.match(/[a-zA-Z0-9_]/)) this.skip(1);
    return this.str.slice(start, this.pos);
  }

  private parseFunctionExpression(): types.FunctionExpression {
    const name = this.parseFunctionName();
    this.ws();
    if (!this.is('(')) throw new Error('Expected "(" after function name');
    this.skip(1); // Skip (
    this.ws();

    const args: (types.ValueExpression | types.FilterExpression | types.JSONPath)[] = [];
    if (!this.is(')')) {
      do {
        this.ws();
        // Try to parse as value expression first
        const arg = this.parseValueExpression();
        args.push(arg);
        this.ws();
        if (this.is(',')) {
          this.skip(1);
          this.ws();
        } else break;
      } while (!this.eof() && !this.is(')'));
    }
    this.ws();
    if (!this.is(')')) throw new Error('Expected ")" to close function arguments');
    this.skip(1);
    return Ast.expression.function(name, args);
  }

  private isComparisonOperator(): boolean {
    return this.is('==') || this.is('!=') || this.is('<=') || this.is('>=') || this.is('<') || this.is('>');
  }

  private parseComparisonOperator(): types.ComparisonExpression['operator'] {
    if (this.is('==')) {
      this.skip(2);
      return '==';
    } else if (this.is('!=')) {
      this.skip(2);
      return '!=';
    } else if (this.is('<=')) {
      this.skip(2);
      return '<=';
    } else if (this.is('>=')) {
      this.skip(2);
      return '>=';
    } else if (this.is('<')) {
      this.skip(1);
      return '<';
    } else if (this.is('>')) {
      this.skip(1);
      return '>';
    }
    throw new Error('Expected comparison operator');
  }

  private parseValueExpression(): types.ValueExpression {
    this.ws();
    const value = Ast.value;
    // Check for function expressions first
    if (this.match(/[a-z]/)) {
      const start = this.pos;
      const name = this.parseFunctionName();
      this.ws();
      if (this.is('(')) {
        // It's a function call - reset and parse as function
        this.pos = start;
        const funcExpr = this.parseFunctionExpression();
        return value.function(funcExpr.name, funcExpr.args);
      } else {
        // Reset position, it's not a function
        this.pos = start;
      }
    }
    if (this.is('@')) {
      this.skip(1);
      if (this.is('.') || this.is('[')) {
        const segments = this.parseFilterPathSegments();
        return value.path(Ast.path(segments));
      }
      return value.current();
    } else if (this.is('$')) {
      // Root node path
      this.skip(1);
      const segments = this.parsePathSegments();
      return value.path(Ast.path(segments));
    } else if (this.is("'") || this.is('"')) {
      // String literal
      return value.literal(this.parseString());
    } else if (this.match(/[0-9-]/)) {
      // Number literal
      return value.literal(this.parseNumber());
    } else if (this.is('true')) {
      this.skip(4);
      return value.literal(true);
    } else if (this.is('false')) {
      this.skip(5);
      return value.literal(false);
    } else if (this.is('null')) {
      this.skip(4);
      return value.literal(null);
    }
    throw new Error('Expected value expression');
  }

  private parsePathSegments(): types.PathSegment[] {
    const segments: types.PathSegment[] = [];
    while (!this.eof()) {
      this.ws();
      if (this.eof()) break;
      // Check if we've reached a delimiter that ends the path
      if (this.is(')') || this.is(',') || this.is('&&') || this.is('||') || this.isComparisonOperator()) break;
      const segment = this.parsePathSegment();
      segments.push(segment);
    }
    return segments;
  }

  private parseFilterPathSegments(): types.PathSegment[] {
    const segments: types.PathSegment[] = [];
    while (!this.eof()) {
      this.ws();
      if (this.eof()) break;
      // Check if we've reached a delimiter that ends the path in filter context
      if (this.is(')') || this.is(',') || this.is('&&') || this.is('||') || this.isComparisonOperator() || this.is(']'))
        break;
      const segment = this.parseFilterPathSegment();
      segments.push(segment);
    }
    return segments;
  }

  private parseFilterPathSegment(): types.PathSegment {
    this.ws();
    const selectors: types.AnySelector[] = [];

    // Check for recursive descent (..)
    const recursive = this.is('..') as boolean;
    if (recursive) {
      this.skip(2); // Skip ..
      // After .., we should have a selector without requiring . or [
      if (this.eof()) {
        throw new Error('Expected selector after ..');
      }
    }

    if (this.is('.')) {
      // Dot notation: .name, .*, etc.
      this.skip(1); // Skip .
      this.ws(); // Skip whitespace after .

      if (this.is('*')) {
        // Wildcard
        this.skip(1);
        selectors.push(Ast.selector.wildcard());
      } else {
        // Named selector
        const name = this.parseIdentifier();
        selectors.push(Ast.selector.named(name));
      }
    } else if (this.is('[')) {
      // Bracket notation: [index], ['name'], [*], [start:end], [a,b,c] etc.
      this.skip(1); // Skip [
      this.ws();

      // Parse comma-separated list of selectors
      do {
        this.ws();
        const selector = this.parseBracketSelector();
        selectors.push(selector);
        this.ws();

        // Check for comma to continue, or ] to end
        if (this.is(',')) {
          this.skip(1); // Skip comma
          this.ws();
        } else {
          break;
        }
      } while (!this.eof() && !this.is(']'));

      this.ws();
      if (!this.is(']')) {
        throw new Error('Expected ] to close bracket selector');
      }
      this.skip(1); // Skip ]
    } else if (recursive && this.match(/[a-zA-Z_*]/)) {
      // After recursive descent, we can have an identifier or wildcard
      if (this.is('*')) {
        this.skip(1);
        selectors.push(Ast.selector.wildcard());
      } else {
        const name = this.parseIdentifier();
        selectors.push(Ast.selector.named(name));
      }
    } else {
      throw new Error('Expected . or [ to start filter path segment');
    }

    if (recursive && selectors.length === 1) {
      return Ast.segment([Ast.selector.recursiveDescent(selectors[0])]);
    }

    return Ast.segment(selectors, recursive || undefined);
  }

  private parseIdentifier(): string {
    const start = this.pos;
    if (!this.match(/[a-zA-Z_]/)) throw new Error('Expected identifier');
    while (this.match(/[a-zA-Z0-9_]/)) this.skip(1);
    return this.str.slice(start, this.pos);
  }

  private parseString(): string {
    const quote = this.peek();
    if (quote !== "'" && quote !== '"') throw new Error('Expected string literal');
    this.skip(1); // Skip opening quote
    const start = this.pos;
    while (!this.eof() && !this.is(quote))
      if (this.is('\\'))
        this.skip(2); // Skip escape sequence
      else this.skip(1);
    if (this.eof()) throw new Error('Unterminated string literal');
    const value = this.str.slice(start, this.pos);
    this.skip(1); // Skip closing quote
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
