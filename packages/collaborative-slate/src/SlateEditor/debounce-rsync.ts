import {rsync} from '@jsonjoy.com/ui';

type SyncSource<T> = Pick<rsync.ReactValue<T>, 'value' | 'subscribe'>;

export interface DebouncedRsyncValue<T> {
  readonly value: rsync.ReactComputed<T, [T]>;
  dispose(): void;
}

export const createDebouncedRsyncValue = <T>(source: SyncSource<T>, debounceMs: number): DebouncedRsyncValue<T> => {
  const settled = rsync.val(source.value);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    timer = null;
    settled.set(source.value);
  };

  const unsubscribe = source.subscribe(() => {
    if (timer) clearTimeout(timer);
    if (debounceMs <= 0) {
      flush();
      return;
    }
    timer = setTimeout(flush, debounceMs);
  });

  return {
    value: rsync.comp([settled], ([value]) => value),
    dispose: () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
};