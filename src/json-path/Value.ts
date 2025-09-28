import type {NormalizedPath} from './types';

export class Value {
  constructor(
    public readonly parent: Value | null,
    public readonly step: string | number,
    public readonly data: unknown,
  ) {}

  public path(): NormalizedPath {
    const segments: (string | number)[] = [];
    let current: Value | null = this;
    while (current) {
      segments.push(current.step);
      current = current.parent;
    }
    segments.reverse();
    return segments;
  }

  public segment(): string {
    const step = this.step;
    if (typeof step === 'number') return '[' + step + ']';
    if (!this.parent) return '$';
    const json = JSON.stringify(step);
    return "['" + json.slice(1, -1) + "']";
  }

  public pointer(): string {
    let str = this.segment();
    let current: Value | null = this.parent;
    while (current) {
      str = current.segment() + str;
      current = current.parent;
    }
    return str;
  }
}
