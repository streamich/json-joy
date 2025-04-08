import {SubscriptionEventTarget} from '../../util/events/TypedEventTarget';
import type {
  PeritextEventDetailMap,
  CursorDetail,
  FormatDetail,
  DeleteDetail,
  MarkerDetail,
  BufferDetail,
} from './types';

export type PeritextEventMap = {
  [K in keyof PeritextEventDetailMap]: CustomEvent<PeritextEventDetailMap[K]>;
};

export type PeritextEventHandlerMap = {
  [K in keyof PeritextEventDetailMap]: (event: CustomEvent<PeritextEventDetailMap[K]>) => void;
};

let __id = 0;

export class PeritextEventTarget extends SubscriptionEventTarget<PeritextEventMap> {
  public readonly id: number = __id++;

  public defaults: Partial<PeritextEventHandlerMap> = {};

  public dispatch<K extends keyof Omit<PeritextEventDetailMap, 'change'>>(
    type: K,
    detail: Omit<PeritextEventDetailMap, 'change'>[K],
  ): void {
    const event = new CustomEvent<PeritextEventDetailMap[K]>(type, {detail});
    this.dispatchEvent(event);
    if (!event.defaultPrevented) this.defaults[type]?.(event);
    this.change(event);
  }

  public change(ev?: CustomEvent<any>): void {
    const event = new CustomEvent<PeritextEventDetailMap['change']>('change', {detail: {ev}});
    this.dispatchEvent(event);
    if (!event.defaultPrevented) this.defaults.change?.(event);
  }

  public insert(text: string): void {
    this.dispatch('insert', {text});
  }

  public delete(len: DeleteDetail['len'], unit?: DeleteDetail['unit'], at?: DeleteDetail['at']): void;
  public delete(detail: DeleteDetail): void;
  public delete(
    lenOrDetail: DeleteDetail | DeleteDetail['len'],
    unit?: DeleteDetail['unit'],
    at?: DeleteDetail['at'],
  ): void {
    const detail: DeleteDetail = typeof lenOrDetail === 'object' ? lenOrDetail : {len: lenOrDetail, unit, at};
    this.dispatch('delete', detail);
  }

  public cursor(detail: CursorDetail): void {
    this.dispatch('cursor', detail);
  }

  public move(len: number, unit?: CursorDetail['unit'], edge?: CursorDetail['edge']): void {
    this.cursor({len, unit, edge});
  }

  public format(type: FormatDetail['type'], behavior?: FormatDetail['behavior'], data?: FormatDetail['data']): void;
  public format(detail: FormatDetail): void;
  public format(
    a: FormatDetail | FormatDetail['type'],
    behavior?: FormatDetail['behavior'],
    data?: FormatDetail['data'],
  ): void {
    const detail: FormatDetail =
      typeof a === 'object' && !Array.isArray(a) ? (a as FormatDetail) : ({type: a, behavior, data} as FormatDetail);
    this.dispatch('format', detail);
  }

  public marker(detail: MarkerDetail): void;
  public marker(action: MarkerDetail['action'], type: MarkerDetail['type'], data?: MarkerDetail['data']): void;
  public marker(a: MarkerDetail | MarkerDetail['action'], b?: MarkerDetail['type'], c?: MarkerDetail['data']): void {
    const detail: MarkerDetail = typeof a === 'object' ? a : {action: a, type: b, data: c};
    this.dispatch('marker', detail);
  }

  public buffer(action: BufferDetail['action'], format?: BufferDetail['format']): void;
  public buffer(detail: BufferDetail): void;
  public buffer(a: BufferDetail | BufferDetail['action'], b?: BufferDetail['format']): void {
    const detail: BufferDetail = typeof a === 'object' ? a : {action: a, format: b};
    this.dispatch('buffer', detail);
  }
}
