export class UndefEndIter<T> implements IterableIterator<T> {
  constructor(private readonly i: () => T | undefined) {}

  public next(): IteratorResult<T> {
    const value = this.i();
    return new IterRes(value, value === undefined) as IteratorResult<T>;
  }

  [Symbol.iterator]() {
    return this;
  }
}

export class IterRes<T> {
  constructor(public readonly value: T, public readonly done: boolean) {}
}
