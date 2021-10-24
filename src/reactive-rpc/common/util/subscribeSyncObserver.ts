import {Observable} from 'rxjs';
import {microtask} from './microtask';

export interface SyncObserver<T> {
  next: (values: T[], completed: boolean) => void;
  error: (error: unknown) => void;
  complete: () => void;
}

/**
 * Subscribes `SyncObserver` to observable. `SyncObserver` a list of all values
 * that were synchronously emitted within one micro-tick cycle.
 *
 * @param observable Observable to which to subscribe.
 * @param observer Observer which to subscribe to observable.
 * @returns Subscription
 */
export function subscribeSyncObserver<T>(observable: Observable<T>, observer: SyncObserver<T>) {
  let completed = false;
  let buffer: T[] = [];
  const flush = () => {
    if (!buffer.length) return;
    observer.next(buffer, completed);
    buffer = [];
  };
  return observable.subscribe({
    next: (data: T) => {
      buffer.push(data);
      if (buffer.length === 1) microtask(flush);
    },
    error: (error: unknown) => {
      flush();
      observer.error(error);
    },
    complete: () => {
      completed = true;
      flush();
      observer.complete();
    },
  });
}
