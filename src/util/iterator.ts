/**
 * Next function which returns `undefined` or a value of type `T`.
 * This is used in iterators that can end with an `undefined` value, which
 * indicates the end of iteration.
 *
 * @todo Rename to `UndEndNext`.
 */
export type UndEndNext<T> = () => undefined | T;

/**
 * Creates an iterator out of {@linke UndefIterator} function.
 */
export class UndEndIterator<T> extends Iterator<T, T> implements IterableIterator<T> {
  constructor(private readonly n: UndEndNext<T>) {
    super();
  }

  public next(): IteratorResult<T, T> {
    const value = this.n();
    return new Res(value, value === undefined) as IteratorResult<T>;
  }
}

class Res<T> {
  constructor(
    public readonly value: T,
    public readonly done: boolean,
  ) {}
}
