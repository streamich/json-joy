import {Anchor} from '../../../../../json-crdt-extensions/peritext/rga/constants';
import type {Peritext} from '../../../../../json-crdt-extensions';
import type {Point} from '../../../../../json-crdt-extensions/peritext/rga/Point';
import type {PeritextUiApi, Rect, UiLineEdge, UiLineInfo} from './types';

export class UiHandle {
  constructor(
    public readonly txt: Peritext,
    public readonly api: PeritextUiApi,
  ) {}

  protected point(pos: number | Point<string>): Point<string> {
    return typeof pos === 'number' ? this.txt.pointAt(pos) : pos;
  }

  /**
   * Finds the position of the character at the given point (position between
   * characters). The first position has index of 0. Have to specify the
   * direction of the search, forward or backward.
   *
   * @param point The index of the character in the text, or a {@link Point}.
   * @param fwd Whether to find the location of the next character after the
   *     given {@link Point} or before, defaults to `true`.
   * @returns The bounding rectangle of the character at the given index.
   */
  public getPointRect(pos: number | Point<string>, right = true): Rect | undefined {
    const txt = this.txt;
    const point = typeof pos === 'number' ? txt.pointAt(pos) : pos.clone();
    if (right) point.refBefore();
    else point.refAfter();
    return this.api.getCharRect?.(point.id);
  }

  public pointX(pos: number | Point<string>): [x: number, rect: Rect] | undefined {
    const txt = this.txt;
    const point = typeof pos === 'number' ? txt.pointAt(pos) : pos;
    const rect = this.getPointRect(point, point.anchor === Anchor.Before);
    if (!rect) return;
    const x = point.anchor === Anchor.Before ? rect.x : rect.x + rect.width;
    return [x, rect];
  }

  public findPointAtX(targetX: number, line: UiLineInfo): Point<string> {
    let point = line[0][0].clone();
    const curr = point;
    let bestDiff = 1e9;
    const max = line[1][0].viewPos() - line[0][0].viewPos();
    if (!this.api.getCharRect) return point;
    for (let i = 0; i < max; i++) {
      const pointX = this.pointX(curr);
      if (!pointX) break;
      const [x] = pointX;
      const diff = Math.abs(x - targetX);
      if (diff <= bestDiff) {
        bestDiff = diff;
        point = curr.clone();
      } else break;
      curr.step(1);
    }
    return point;
  }

  public getLineEnd(pos: number | Point<string>, right = true): UiLineEdge | undefined {
    const startPoint = this.point(pos);
    if (startPoint.isAbs()) return;
    const startRect = this.getPointRect(startPoint, right);
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
      const next = curr.copy((p) => p.step(right ? 1 : -1));
      if (!next) return prepareReturn();
      if (next.isAbs()) return prepareReturn();
      const nextRect = this.getPointRect(next, right);
      if (!nextRect) return prepareReturn();
      if (right ? nextRect.x < currRect.x : nextRect.x > currRect.x) return prepareReturn();
      curr = next;
      currRect = nextRect;
    }
  }

  public getLineInfo(pos: number | Point<string>): UiLineInfo | undefined {
    const txt = this.txt;
    const point = this.point(pos);
    if (point.isAbs()) return;
    const isEndOfText = point.viewPos() === txt.strApi().length();
    if (isEndOfText) return;
    const left = this.getLineEnd(point, false);
    const right = this.getLineEnd(point, true);
    if (!left || !right) return;
    return [left, right];
  }

  public getNextLineInfo(line: UiLineInfo, direction: 1 | -1 = 1): UiLineInfo | undefined {
    const edge = line[direction > 0 ? 1 : 0][0];
    const txt = this.txt;
    if (edge.viewPos() >= txt.str.length()) return;
    const point = edge.copy((p) => p.step(direction));
    const success = txt.overlay.skipMarkers(point, direction);
    if (!success) return;
    if (point.isAbs()) return;
    return this.getLineInfo(point);
  }
}
