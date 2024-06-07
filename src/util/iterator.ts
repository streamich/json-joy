export type UndefIterator<T> = () => undefined | T;

export class UndefEndIter<T> implements IterableIterator<T> {
  constructor(private readonly i: UndefIterator<T>) {}

  public next(): IteratorResult<T, T> {
    const value = this.i();
    return new IterRes(value, value === undefined) as IteratorResult<T>;
  }

  [Symbol.iterator]() {
    return this;
  }
}

export class IterRes<T> {
  constructor(
    public readonly value: T,
    public readonly done: boolean,
  ) {}
}

export const iter = <T>(i: UndefIterator<T>) => new UndefEndIter(i);
