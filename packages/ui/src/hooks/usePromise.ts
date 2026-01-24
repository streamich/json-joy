import {useLayoutEffect, useState, type DependencyList} from 'react';

export type PromiseState<T> = [value: undefined | T, error: undefined | unknown, state: 0 | 1 | 2];

export const usePromise = <T>(promise: Promise<T>, deps: DependencyList): PromiseState<T> => {
  const [state, setState] = useState<PromiseState<T>>([undefined, undefined, 0]);

  useLayoutEffect(() => {
    promise.then(
      (value) => setState([value, undefined, 1]),
      (error) => setState([undefined, error, 2]),
    );
  }, deps);

  return state;
};
