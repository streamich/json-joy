export class KeyMap {
  /** Single key press bindings. */
  public single: Map<string, () => void> = new Map();

  public bind(key: string, action: () => void): void {
    this.single.set(key, action);
  }
}
