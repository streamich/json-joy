import {defer, Observable, merge, fromEvent, map} from "rxjs";

export const resize$ = (el: HTMLElement): Observable<number> => {
  let cnt = 0;
  return new Observable<number>((subscriber) => {
    const resizeObserver = new ResizeObserver(() => subscriber.next(cnt++));
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  });
};

export const rerender$ = (el: HTMLElement): Observable<void> => defer(
  () => merge(
    resize$(el),
    fromEvent(window, "resize"),
    fromEvent(window, "scroll"),
  )
).pipe(
  map(() => void 0)
);
