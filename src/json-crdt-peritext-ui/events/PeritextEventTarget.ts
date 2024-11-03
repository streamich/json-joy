import {TypedEventTarget} from './TypedEventTarget';
import type {PeritextEventMap, CursorDetail, InlineDetail, DeleteDetail} from './types';

export type PeritextEventHandlerMap = {
  [K in keyof PeritextEventMap]: (event: CustomEvent<PeritextEventMap[K]>) => void;
};

let __id = 0;

export class PeritextEventTarget extends TypedEventTarget<PeritextEventMap> {
  public readonly id: number = __id++;

  public defaults: Partial<PeritextEventHandlerMap> = {};

  public dispatch<K extends keyof Omit<PeritextEventMap, 'change'>>(
    type: K,
    detail: Omit<PeritextEventMap, 'change'>[K],
  ): void {
    const event = new CustomEvent<PeritextEventMap[K]>(type, {detail});
    this.dispatchEvent(event);
    if (!event.defaultPrevented) this.defaults[type]?.(event);
    this.change(event);
  }

  public change(ev?: CustomEvent<any>): void {
    const event = new CustomEvent<PeritextEventMap['change']>('change', {detail: {ev}});
    this.dispatchEvent(event);
    if (!event.defaultPrevented) this.defaults.change?.(event);
  }

  public insert(text: string): void {
    this.dispatch('insert', {text});
  }

  public delete(len: DeleteDetail['len'], unit?: DeleteDetail['unit'], at?: DeleteDetail['at']): void;
  public delete(detail: DeleteDetail): void;
  public delete(lenOrDetail: DeleteDetail | DeleteDetail['len'], unit?: DeleteDetail['unit'], at?: DeleteDetail['at']): void {
    const detail: DeleteDetail = typeof lenOrDetail === 'object' ? lenOrDetail : {len: lenOrDetail, unit, at};
    this.dispatch('delete', detail);
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
