import {SubscriptionEventTarget} from '../../util/events/TypedEventTarget';
import type {
  PeritextEventDetailMap,
  CursorDetail,
  FormatDetail,
  DeleteDetail,
  MarkerDetail,
  BufferDetail,
  SelectionMoveInstruction,
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

  public delete(len: number, unit?: SelectionMoveInstruction[1]): void;
  public delete(
    edge: SelectionMoveInstruction[0],
    unit: SelectionMoveInstruction[1],
    len?: SelectionMoveInstruction[2],
    collapse?: SelectionMoveInstruction[3],
  ): void;
  public delete(detail?: DeleteDetail): void;
  public delete(a: any = {}, b?: any, len?: any, collapse?: any): void {
    if (typeof a === 'number') {
      this.dispatch('delete', {move: [['focus', b ?? 'char', a]]});
    } else if (typeof a === 'string') {
      const move: SelectionMoveInstruction[] = [[a as SelectionMoveInstruction[0], b, len, collapse]];
      this.dispatch('delete', {move});
    } else {
      this.dispatch('delete', a);
    }
  }

  public cursor(detail: CursorDetail): void {
    this.dispatch('cursor', detail);
  }

  public move(
    edge: SelectionMoveInstruction[0],
    unit: SelectionMoveInstruction[1],
    len?: SelectionMoveInstruction[2],
    collapse?: SelectionMoveInstruction[3],
  ): void;
  public move(move?: CursorDetail['move'], at?: CursorDetail['at']): void;
  public move(a?: any, b?: any, len?: any, collapse?: any): void {
    if (typeof a === 'string') {
      const move: SelectionMoveInstruction[] = [[a as SelectionMoveInstruction[0], b, len, collapse]];
      this.cursor({move});
    } else {
      this.cursor({move: a, at: b});
    }
  }

  public format(action: FormatDetail['action'], type: FormatDetail['type'], stack?: FormatDetail['stack'], data?: FormatDetail['data']): void;
  public format(detail: FormatDetail): void;
  public format(
    a: FormatDetail | FormatDetail['action'],
    type?: FormatDetail['type'],
    stack?: FormatDetail['stack'],
    data?: FormatDetail['data'],
  ): void {
    const detail: FormatDetail =
      typeof a === 'object' && !Array.isArray(a) ? (a as FormatDetail) : ({action: a, type, stack, data} as FormatDetail);
    this.dispatch('format', detail);
  }

  public marker(action: MarkerDetail['action'], type: MarkerDetail['type'], data?: MarkerDetail['data']): void;
  public marker(detail: MarkerDetail): void;
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
