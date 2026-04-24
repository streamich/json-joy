import {useSyncExternalStore} from 'react';
import {Value, Computed, type WrapListInSyncDep} from 'thingies/lib/sync';
import {deepEqual} from '@jsonjoy.com/json-equal';

export class ReactValue<T> extends Value<T> {
  public use(): T {
    return useSyncExternalStore(this.subscribe, this.getSnapshot);
  }

  public set(value: T): void {
    const oldValue = this.value;
    if (!deepEqual(oldValue, value)) this.next(value);
  }

  public toString(): string {
    return this.value + '';
  }
}

export const val = <T>(value: T) => new ReactValue<T>(value);

export class ReactComputed<N, V extends unknown[] = any> extends Computed<N, V> {
  public use(): N {
    return useSyncExternalStore(this.subscribe, this.getSnapshot);
  }

  public toString(): string {
    return this.value + '';
  }
}

export const comp = <N, V extends unknown[] = any>(deps: WrapListInSyncDep<V>, compute: (args: V) => N) =>
  new ReactComputed<N, V>(deps, compute);

export type ElBoxValue = [x: number, y: number, width: number, height: number];

const getSize = (el: HTMLElement): ElBoxValue => {
  const box = el.getBoundingClientRect();
  return [box.left, box.top, box.width, box.height];
};

export class ElBox<El extends HTMLElement = HTMLElement> extends ReactValue<ElBoxValue> {
  private el?: El;
  private _observer?: ResizeObserver;
  private _rafId = 0;

  private readonly _flushSize = () => {
    this._rafId = 0;
    const el = this.el;
    if (el) this.set(getSize(el));
  };

  private readonly _scheduleMeasure = () => {
    if (this._rafId || typeof window === 'undefined') {
      if (!this._rafId) this._flushSize();
      return;
    }
    this._rafId = window.requestAnimationFrame(this._flushSize);
  };

  constructor(el?: El, size?: ElBoxValue) {
    super(el ? getSize(el) : (size ?? [0, 0, 0, 0]));
    if (el) this.setEl(el);
  }

  public readonly setEl = (el: El | null | undefined = void 0) => {
    const oldEl = this.el;
    if (oldEl) this._observer?.unobserve(oldEl);
    if (!this._observer) {
      this._observer = new ResizeObserver(() => {
        this._scheduleMeasure();
      });
    }
    if (this._rafId && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
    this.el = el ?? void 0;
    if (el) {
      this._observer?.observe(el);
      this.set(getSize(el));
    }
  };

  public dispose(): void {
    this.setEl(void 0);
    if (this._rafId && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
    this._observer?.disconnect();
  }
}
