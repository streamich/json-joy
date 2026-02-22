import {BehaviorSubject} from 'rxjs';
import {ToastItem, type ToastItemOpts} from './ToastItem';
import type {ToastItemPublic} from './types';

export class ToastStack {
  public readonly stack$ = new BehaviorSubject<ToastItem[]>([]);

  public readonly add = (opts: ToastItemOpts): ToastItemPublic => {
    const item = new ToastItem(this, opts);
    this.stack$.next([...this.stack$.getValue(), item]);
    return item;
  };

  public readonly remove = (item: ToastItem) => {
    const stack = this.stack$.getValue();
    const index = stack.indexOf(item);
    if (index < 0) return;
    stack.splice(index, 1);
    this.stack$.next(stack);
  };
}
