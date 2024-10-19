import {TypedEventTarget} from './TypedEventTarget';
import {type PeritextEventMap, CursorDetail, InlineDetail, DeleteDetail} from './types';

export type PeritextEventHandlerMap = {
  [K in keyof PeritextEventMap]: (event: CustomEvent<PeritextEventMap[K]>) => void;
};

let id = 0;

export class PeritextEventTarget extends TypedEventTarget<PeritextEventMap> {
  public readonly id: number = id++;

  public defaults: Partial<PeritextEventHandlerMap> = {};

  public dispatch<K extends keyof PeritextEventMap>(type: K, detail: PeritextEventMap[K]): void {
    const event = new CustomEvent<PeritextEventMap[K]>(type, {detail});
    this.dispatchEvent(event);
    this.defaults[type]?.(event);
  }

  public change(ev?: Event): void {
    this.dispatch('change', {ev});
  }

  public insert(text: string): void {
    this.dispatch('insert', {text});
  }

  public delete(direction?: -1 | 0 | 1, unit?: DeleteDetail['unit']): void {
    this.dispatch('delete', {direction, unit});
  }

  public cursor(detail: CursorDetail): void {
    this.dispatch('cursor', detail);
  }

  public move(len: number, unit?: CursorDetail['unit'], edge?: CursorDetail['edge']): void {
    this.cursor({len, unit, edge});
  }

  public inline(detail: InlineDetail): void {
    this.dispatch('inline', detail);
  }
}
