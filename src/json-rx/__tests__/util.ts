export class Defer<T> {
  public readonly resolve!: (value: T) => void;
  public readonly reject!: (error: any) => void;
  public readonly promise = new Promise((resolve, reject) => {
    (this as any).resolve = resolve;
    (this as any).reject = reject;
  });
}
