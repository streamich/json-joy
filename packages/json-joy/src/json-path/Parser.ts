/**
 * Basic parser utility class for managing input string and position
 * in the parsing process.
 */
export class Parser {
  public str: string;
  public pos: number;

  constructor() {
    this.str = '';
    this.pos = 0;
  }

  public reset(input: string): void {
    this.str = input;
    this.pos = 0;
  }

  public eof(): boolean {
    return this.pos >= this.str.length;
  }

  public peek(len: number = 1): string {
    const {str, pos} = this;
    if (pos >= str.length) return '';
    return (len === 1 ? str[pos] : str.slice(pos, pos + len)) || '';
  }

  public is(expected: string): boolean {
    const {str, pos} = this;
    if (pos >= str.length) return false;
    return str.slice(pos).startsWith(expected);
  }

  /**
   * Match the current position against a regular expression.
   *
   * @param reg - Regular expression to match against the current position.
   * @returns The length of the match if successful, otherwise 0.
   */
  public match(reg: RegExp): number {
    const {str, pos} = this;
    if (pos >= str.length) return 0;
    const m = str.slice(pos).match(reg);
    return m && m.index === 0 && m[0] ? m[0].length : 0;
  }

  public skip(count: number): void {
    this.pos += count;
  }

  public ws(): void {
    while (!this.eof() && /\s/.test(this.str[this.pos])) {
      this.pos++;
    }
  }
}
