import * as React from 'react';
import type {UiLifeCycles} from '../../types';

class MovementState implements UiLifeCycles {
  div: HTMLSpanElement | null = null;
  dx: number = 0;
  dy: number = 0;

  constructor(
    public gap: number = 4,
    public readonly vertical = false,
  ) {}

  public readonly move = () => {
    const {div} = this;
    if (!div) return;
    const rect = div.getBoundingClientRect();
    const {x, y, width, height} = rect;
    if (!width || !height) return;
    const leftSpace = x - this.gap;
    if (leftSpace < 0) {
      this.dx += -leftSpace;
    } else if (leftSpace > 0) {
      if (this.dx > 0) this.dx = Math.max(0, this.dx - leftSpace);
      else {
        const rightSpace = window.innerWidth - x - width - this.gap;
        if (rightSpace < 0) this.dx += rightSpace;
        else if (rightSpace > 0) {
          if (this.dx < 0) this.dx = Math.min(0, this.dx + rightSpace);
        }
      }
    }
    if (this.vertical) {
      const topSpace = y - this.gap;
      if (topSpace < 0) {
        this.dy += -topSpace;
      } else if (topSpace > 0) {
        if (this.dy > 0) this.dy = Math.max(0, this.dy - topSpace);
        else {
          const bottomSpace = window.innerHeight - y - height - this.gap;
          if (bottomSpace < 0) this.dy += bottomSpace;
          else if (bottomSpace > 0) {
            if (this.dy < 0) this.dy = Math.min(0, this.dy + bottomSpace);
          }
        }
      }
    }
    const style = div.style;
    style.left = this.dx + 'px';
    if (this.vertical) style.top = this.dy + 'px';
  };

  public readonly start = () => {
    window.addEventListener('resize', this.move);
    const timer = setTimeout(this.move, 25);
    return () => {
      window.removeEventListener('resize', this.move);
      clearTimeout(timer);
    };
  };

  public readonly ref = (div: HTMLSpanElement | null) => {
    this.div = div;
    this.move();
  };
}

export interface MoveToViewportProps extends React.HTMLAttributes<HTMLSpanElement> {
  gap?: number;
  /** Whether to adjust vertical position, too. */
  vertical?: boolean;
  children: React.ReactNode;
}

/**
 * Moves the contents into the viewport if it is rendered outside of it.
 */
export const MoveToViewport: React.FC<MoveToViewportProps> = ({gap, vertical, children, ...attr}) => {
  const state = React.useMemo(() => new MovementState(gap, vertical), [gap, vertical]);
  React.useEffect(state.start, []);

  return (
    <span ref={state.ref} style={{position: 'relative'}} {...attr}>
      {children}
    </span>
  );
};
