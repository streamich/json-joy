import {Observable, Observer} from 'rxjs';

export class PubsubService {
  private readonly observers = new Map<string, Observer<unknown>[]>();

  public listen$(channel: string): Observable<unknown> {
    return new Observable<unknown>((observer) => {
      if (!this.observers.has(channel)) this.observers.set(channel, []);
      const observers: Observer<unknown>[] = this.observers.get(channel)!;
      observers.push(observer);
      return () => {
        const observers: Observer<unknown>[] = this.observers.get(channel)!;
        if (!observers) return;
        const index = observers.findIndex((o) => o === observer);
        if (index > -1) observers.splice(index, 1);
        if (!observers.length) {
          this.observers.delete(channel);
        }
      };
    });
  }

  public async publish(channel: string, message: unknown): Promise<void> {
    await new Promise((resolve) => setImmediate(resolve));
    const observers = this.observers.get(channel);
    if (!observers) return;
    for (const observer of observers) observer.next(message);
  }

  public stats(): {channels: number; observers: number} {
    return {
      channels: this.observers.size,
      observers: [...this.observers.values()].reduce((acc, v) => acc + v.length, 0),
    };
  }
}
