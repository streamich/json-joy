import * as React from 'react';
import type {AnchorPoint, AnchorPointComputeSpec, RefPopupToggle} from './types';

const updateAnchorPoint = (
  toggle?: HTMLElement | null | undefined,
  {gap = 4, off = 0, horizontal, center, topIf}: AnchorPointComputeSpec = {},
  anchor: AnchorPoint = {x: 0, y: 0, dx: 1, dy: 1},
): AnchorPoint => {
  if (!toggle) return anchor;
  const {left: ex0, right: ex1, top: ey0, bottom: ey1} = toggle.getBoundingClientRect();
  const sx0 = 0,
    sx1 = window.innerWidth,
    sy0 = 0,
    sy1 = window.innerHeight;
  const spaceToRight = sx1 - ex0;
  const spaceToLeft = ex1 - sx0;
  const spaceToBottom = sy1 - ey0;
  const spaceToTop = ey1 - sy0;
  if (horizontal) {
    if (spaceToRight > spaceToLeft) {
      anchor.x = ex1 + gap;
      anchor.dx = 1;
    } else {
      anchor.x = ex0 - gap;
      anchor.dx = -1;
    }
    if (center) {
      anchor.y = ey0 + (ey1 - ey0) * 0.5;
      anchor.dy = 0;
    } else {
      if (spaceToBottom > spaceToTop) {
        anchor.y = ey0 + off;
        anchor.dy = 1;
      } else {
        anchor.y = ey1 - off;
        anchor.dy = -1;
      }
    }
  } else {
    if (center) {
      anchor.x = ex0 + (ex1 - ex0) * 0.5;
      anchor.dx = 0;
    } else {
      if (spaceToRight > spaceToLeft) {
        anchor.x = ex0 + off;
        anchor.dx = 1;
      } else {
        anchor.x = ex1 - off;
        anchor.dx = -1;
      }
    }
    if (spaceToBottom <= spaceToTop || (topIf && topIf <= spaceToTop)) {
      anchor.y = ey0 - gap;
      anchor.dy = -1;
    } else {
      anchor.y = ey1 + gap;
      anchor.dy = 1;
    }
  }
  return anchor;
};

export class AnchorPointHandle implements AnchorPoint {
  public static fromPoint = (point: AnchorPoint): AnchorPointHandle => {
    const handle = new AnchorPointHandle();
    handle.x = point.x;
    handle.y = point.y;
    handle.dx = point.dx;
    handle.dy = point.dy;
    return handle;
  };

  public x: AnchorPoint['x'] = 0;
  public y: AnchorPoint['y'] = 0;
  public dx: AnchorPoint['dx'] = 1;
  public dy: AnchorPoint['dy'] = 1;
  public toggle: HTMLElement | null = null;
  public drop: HTMLElement | null = null;

  constructor(public spec: AnchorPointComputeSpec = {}) {}

  public readonly ref: RefPopupToggle = (toggle) => {
    this.toggle = toggle;
  };

  public readonly refDrop: RefPopupToggle = (drop) => {
    this.drop = drop;
    if (drop) this.style();
  };

  public style(): React.CSSProperties {
    updateAnchorPoint(this.toggle, this.spec, this);
    const style: React.CSSProperties = {};
    const {x, y, dx, dy} = this;
    if (dx >= 0) style.left = x + 'px';
    else style.right = window.innerWidth - x + 'px';
    if (dy >= 0) style.top = y + 'px';
    else style.bottom = window.innerHeight - y + 'px';
    if (!dx || !dy) style.transform = 'translate(' + (dx ? 0 : '-50%') + ',' + (dy ? 0 : '-50%') + ')';
    const drop = this.drop;
    if (drop) {
      const s = drop.style;
      for (const key in style) s[key as any] = (style as any)[key as any];
    }
    return style;
  }

  public get(): AnchorPoint {
    this.style();
    return this;
  }

  public maxHeight(): number {
    const {pad = 8} = this.spec;
    const {y, dy} = this;
    if (dy === 1) return window.innerHeight - y - pad;
    if (dy === -1) return y - pad;
    return window.innerHeight - pad - pad;
  }
}
