import type {Peritext} from '../../../../json-crdt-extensions';
import type {Point} from '../../../../json-crdt-extensions/peritext/rga/Point';
import type {PeritextUiApi, UiLineEdge, UiLineInfo} from './types';

export class UiHandle {
  constructor(
    public readonly txt: Peritext,
    public readonly api: PeritextUiApi,
  ) {}

  protected point(pos: number | Point<string>): Point<string> {
    return typeof pos === 'number' ? this.txt.pointAt(pos) : pos;
  }

  public getLineEnd(pos: number | Point<string>, right = true): UiLineEdge | undefined {
    const api = this.api;
    if (!api.getCharRect) return;
    const startPoint = this.point(pos);
    const startRect = api.getCharRect(startPoint, right);
    if (!startRect) return;
    let curr = startPoint.clone();
    let currRect = startRect;
    const prepareReturn = (): UiLineEdge => {
      if (right) {
        curr.step(1);
        curr.refAfter();
      } else {
        curr.step(-1);
        curr.refBefore();
      }
      return [curr, currRect];
    };
    while (true) {
      const next = curr.copy(p => p.step(right ? 1 : -1));
      if (!next) return prepareReturn();
      const nextRect = api.getCharRect(next, right);
      if (!nextRect) return prepareReturn();
      if (right ? nextRect.x < currRect.x : nextRect.x > currRect.x) return prepareReturn();
      curr = next;
      currRect = nextRect;
    }
  }

  public getLineInfo(pos: number | Point<string>): UiLineInfo | undefined {
    const txt = this.txt;
    const point = this.point(pos);
    const isEndOfText = point.viewPos() === txt.strApi().length();
    if (isEndOfText) return;
    const left = this.getLineEnd(point, false);
    const right = this.getLineEnd(point, true);
    if (!left || !right) return;
    return [left, right];
  }
}
