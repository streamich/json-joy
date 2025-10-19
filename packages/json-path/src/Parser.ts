/**
 * Basic parser utility class for managing input string and position
 * in the parsing process.
 */
export class Parser {
  public str: string;
  public pos: number;
  public length: number;

  constructor() {
    this.str = '';
    this.pos = 0;
    this.length = 0;
  }

  public reset(input: string): void {
    this.str = input;
    this.pos = 0;
    this.length = input.length;
  }

  public eof(): boolean {
    return this.pos >= this.length;
  }

  public peek(len: number = 1): string {
    const {str, pos, length} = this;
    if (pos >= length) return '';
    return (len === 1 ? str[pos] : str.slice(pos, pos + len)) || '';
  }

  public is(expected: string): boolean {
    const {str, pos, length} = this;
    const expLen = expected.length;
    if (pos + expLen > length) return false;
    
    // Optimized: check character by character without creating substring
    for (let i = 0; i < expLen; i++) {
      if (str[pos + i] !== expected[i]) return false;
    }
    return true;
  }

  /**
   * Match the current position against a regular expression.
   *
   * @param reg - Regular expression to match against the current position.
   * @returns The length of the match if successful, otherwise 0.
   */
  public match(reg: RegExp): number {
    const {str, pos, length} = this;
    if (pos >= length) return 0;
    const m = str.slice(pos).match(reg);
    return m && m.index === 0 && m[0] ? m[0].length : 0;
  }

  public skip(count: number): void {
    this.pos += count;
  }

  public ws(): void {
    const {str, length} = this;
    let pos = this.pos;
    // Optimized: direct character code checks instead of regex
    while (pos < length) {
      const code = str.charCodeAt(pos);
      // Check for space (32), tab (9), newline (10), carriage return (13)
      if (code === 32 || code === 9 || code === 10 || code === 13) {
        pos++;
      } else {
        break;
      }
    }
    this.pos = pos;
  }
}
