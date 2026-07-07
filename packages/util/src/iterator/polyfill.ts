if (typeof Iterator === 'undefined' && typeof globalThis === 'object') {
  class Iterator<T> {
    [Symbol.iterator]() {
      return this;
    }

    public find(predicate: (value: unknown) => boolean): T | undefined {
      for (const value of this as any) if (predicate(value)) return value;
      return;
    }
  }

  /**
   * The `Iterator` global class is new, so we need to check if it exists.
   */
  (globalThis as any).Iterator = Iterator;
}
