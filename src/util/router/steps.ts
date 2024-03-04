export class ExactStep {
  constructor(public readonly text: string) {}

  public toText() {
    return this.text;
  }
}

export class UntilStep {
  constructor(
    public readonly name: string,
    public readonly until: string,
  ) {}

  public toText() {
    const until = this.until === '\n' ? '\\n' : this.until;
    return `{${this.name}::${until}}`;
  }
}

export class RegexStep {
  constructor(
    public readonly name: string,
    public readonly regex: string,
    public readonly until: string,
  ) {}

  public toText() {
    const regex = this.regex || this.until ? ':' + this.regex : '';
    const until = this.until ? ':' + this.until : '';
    return `{${this.name}${regex}${until}}`;
  }
}
