import type {Peritext} from '../../../../json-crdt-extensions';
import type {Point} from '../../../../json-crdt-extensions/peritext/rga/Point';
import type {Rect} from '../../../dom/types';
import type {PeritextUiApi} from './types';

export class UiHandle {
  constructor(
    public readonly txt: Peritext,
    public readonly api: PeritextUiApi,
  ) {}

  public getLineEnd(pos: number | Point<string>, right = true): [point: Point, rect: Rect] | undefined {
    const api = this.api;
    if (!api.getCharRect) return;
    const txt = this.txt;
    const startPoint = typeof pos === 'number' ? txt.pointAt(pos) : pos;
    const startRect = api.getCharRect(startPoint, right);
    if (!startRect) return;
    let curr = startPoint.clone();
    let currRect = startRect;
    const prepareReturn = (): [point: Point, rect: Rect] => {
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
}
