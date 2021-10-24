import {Observable} from 'rxjs';
import {microtask} from './microtask';

export interface CompleteObserver<T> {
  next: (value: T) => void;
  error: (error: unknown) => void;
  complete: (value: undefined | T, hasValue: boolean) => void;
}

/**
 * Subscribes `CompleteObserver` to observable. `CompleteObserver` attempts to
 * receive the last emitted value in `.complete(value)` callback, instead of
 * calling `.next(value)` followed by `.complete()`.
 *
 * @param observable Observable to which to subscribe.
 * @param observer Observer which to subscribe to observable.
 * @returns Subscription
 */
export function subscribeCompleteObserver<T>(observable: Observable<T>, observer: CompleteObserver<T>) {
  let completed = false;
  let completeCalled = false;
  let tasks = 0;
  return observable.subscribe({
    next: (value: T) => {
      tasks++;
      microtask(() => {
        tasks--;
        if (completed && !tasks) {
          completeCalled = true;
          observer.complete(value, true);
        } else {
          observer.next(value);
        }
      });
    },
    error: (error: unknown) => {
      if (!tasks) observer.error(error);
      else
        microtask(() => {
          observer.error(error);
        });
    },
    complete: () => {
      completed = true;
      if (completeCalled) return;
      if (!tasks) observer.complete(undefined, false);
      else {
        microtask(() => {
          if (completeCalled) return;
          observer.complete(undefined, false);
        });
      }
    },
  });
}
