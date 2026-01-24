import * as React from 'react';
import {BehaviorSubject} from 'rxjs';
import type {ToastItemPublic} from './types';
import type {ToastStack} from './ToastStack';

export interface ToastItemOpts {
  id?: string;
  type?: string;
  title?: React.ReactNode;
  message?: React.ReactNode;
  duration?: number;
  noClose?: boolean;
}

export class ToastItem implements ToastItemPublic {
  public readonly durationConsumed$ = new BehaviorSubject<number>(0);
  public readonly softDeletedTime$ = new BehaviorSubject<number>(0);

  constructor(
    protected readonly stack: ToastStack,
    public readonly opts: ToastItemOpts,
  ) {
    opts.id ??= Math.random().toString(36).slice(2);
  }

  public readonly remove = () => {
    const {softDeletedTime$} = this;
    if (!softDeletedTime$.getValue()) {
      this.softDeletedTime$.next(Date.now());
      setTimeout(() => {
        this.hardRemove();
      }, 2000);
    }
  };

  public readonly hardRemove = () => {
    this.stack.remove(this);
  };

  public readonly consume = (time: number) => {
    const newValue = this.durationConsumed$.getValue() + time;
    this.durationConsumed$.next(newValue);
    if (this.opts.duration && newValue >= this.opts.duration) this.remove();
  };
}
