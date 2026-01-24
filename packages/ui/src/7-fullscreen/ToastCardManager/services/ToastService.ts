import {ToastStack} from './ToastStack';
import type {ToastItemOpts} from './ToastItem';
import type {ToastItemPublic} from './types';

export interface NewToastItemOpts extends ToastItemOpts {
  right?: boolean;
  bottom?: boolean;
}

export class ToastService {
  public readonly topLeft = new ToastStack();
  public readonly topRight = new ToastStack();
  public readonly bottomLeft = new ToastStack();
  public readonly bottomRight = new ToastStack();

  public readonly add = (opts: NewToastItemOpts): ToastItemPublic => {
    const stack =
      (opts.right ?? true)
        ? (opts.bottom ?? true)
          ? this.bottomRight
          : this.topRight
        : (opts.bottom ?? true)
          ? this.bottomLeft
          : this.topLeft;
    const item = stack.add(opts);
    return item;
  };
}
