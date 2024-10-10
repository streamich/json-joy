import {TypedEventTarget} from './TypedEventTarget';
import {type PeritextEventMap, type TextUnit, CursorDetail, type Edge} from './types';

let id = 0;

export class PeritextEventTarget extends TypedEventTarget<PeritextEventMap> {
  public readonly id: number = id++;

  public dispatch<K extends keyof PeritextEventMap>(type: K, detail: PeritextEventMap[K]): void {
    const event = new CustomEvent<PeritextEventMap[K]>(type, {detail});
    this.dispatchEvent(event);
  }

  public change(ev?: Event): void {
    this.dispatch('change', {ev});
  }

  public insert(text: string): void {
    this.dispatch('insert', {text});
  }

  public delete(forward?: boolean, unit?: TextUnit): void {
    this.dispatch('delete', {forward, unit});
  }

  public cursor(detail: CursorDetail): void {
    this.dispatch('cursor', detail);
  }

  public move(len: number, unit?: TextUnit, edge?: Edge): void {
    this.cursor({len, unit, edge});
  }
}
