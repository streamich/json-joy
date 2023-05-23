export class TypeExportContext {
  public readonly refs = new Map<string, 'mentioned' | 'visited'>();

  public mentionRef(ref: string): void {
    if (!this.refs.has(ref)) this.refs.set(ref, 'mentioned');
  }

  public nextMentionedRef(): string | undefined {
    for (const [ref, type] of this.refs) if (type === 'mentioned') return ref;
    return undefined;
  }

  public visitRef(ref: string): void {
    this.refs.set(ref, 'visited');
  }
}
