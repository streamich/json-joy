import {BehaviorSubject} from "rxjs";

export const subject = <T, N>(source: BehaviorSubject<T>, mapper: (value: T) => N): BehaviorSubject<N> => {
  const value = mapper(source.getValue());
  const observable = new BehaviorSubject<N>(value);
  source.subscribe((value) => {
    observable.next(mapper(value));
  });
  return observable;
};
