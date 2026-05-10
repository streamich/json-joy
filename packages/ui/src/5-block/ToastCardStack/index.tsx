import * as React from 'react';
import {ZINDEX} from '../../constants';

export interface ToastCardStackProps {
  /** Anchor the stack to the right edge. */
  right?: boolean;
  /** Center the cards horizontally. Overrides `right` when set. */
  center?: boolean;
  /** Stack direction. */
  bottom?: boolean;
  /** Render at fixed screen position with the toast z-index. */
  global?: boolean;
  /** Vertical gap between cards when expanded (hovered). Default: 8. */
  gap?: number;
  /** How many pixels each older card peeks past the next-newer card when stacked. Default: 24. */
  peek?: number;
  /** Scale step subtracted per generation when stacked. Default: 0.05. */
  scaleStep?: number;
  /** Number of older cards visible behind the newest. Older ones are kept mounted but hidden. Default: 4. */
  maxVisible?: number;
  /** Milliseconds to wait before collapsing after the mouse leaves; reduces flicker when the mouse passes through gaps. Default: 90. */
  leaveDelay?: number;
  /** Children. Convention: newest at the END of the array (matches `[...stack, newItem]`). */
  children: React.ReactNode | React.ReactNode[];
}

const TRANSITION = 'transform 380ms cubic-bezier(.2,1,.4,1), opacity 240ms ease, padding 380ms cubic-bezier(.2,1,.4,1)';

export const ToastCardStack: React.FC<ToastCardStackProps> = ({
  right,
  center,
  bottom,
  global,
  gap = 8,
  peek = 24,
  scaleStep = 0.05,
  maxVisible = 4,
  leaveDelay = 90,
  children,
}) => {
  const items = React.useMemo(() => {
    const arr = Array.isArray(children) ? children : [children];
    return arr.filter((c): c is React.ReactNode => !!c);
  }, [children]);
  const N = items.length;
  const newestIdx = N - 1;

  const [hovered, setHovered] = React.useState(false);
  const [heights, setHeights] = React.useState<number[]>([]);
  const cardRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const leaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Measure heights via ResizeObserver — needed for the expanded layout.
  React.useLayoutEffect(() => {
    cardRefs.current.length = N;
    const next: number[] = new Array(N).fill(0);
    const ros: ResizeObserver[] = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      next[i] = el.offsetHeight;
      const ro = new ResizeObserver(() => {
        const h = el.offsetHeight;
        setHeights((prev) => {
          if (prev[i] === h) return prev;
          const copy = prev.slice();
          copy[i] = h;
          return copy;
        });
      });
      ro.observe(el);
      ros.push(ro);
    });
    setHeights(next);
    return () => ros.forEach((r) => r.disconnect());
  }, [N]);

  // Total upward (or downward) extent of the spread region above the newest card.
  // Used to expand the wrapper's hit-box so the mouse never escapes when passing
  // through gaps between cards.
  const expandedExtent = React.useMemo(() => {
    let sum = 0;
    for (let i = 0; i < newestIdx; i++) sum += (heights[i] || 0) + gap;
    return sum;
  }, [heights, newestIdx, gap]);

  const onEnter = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setHovered(true);
  };
  const onLeave = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setHovered(false), leaveDelay);
  };

  React.useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const sign = bottom ? -1 : 1;

  const horizontalAlign: 'start' | 'center' | 'end' = center ? 'center' : right ? 'end' : 'start';

  // Single-cell grid: every card occupies the same area, so the wrapper sizes
  // to the WIDEST and TALLEST card. Each card keeps its natural width — narrow
  // newer cards no longer squeeze the older wider ones.
  const wrapperStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateAreas: '"stack"',
    alignItems: bottom ? 'end' : 'start',
    justifyItems: horizontalAlign,
    transition: TRANSITION,
    // Extend the wrapper's bounding box to cover the entire spread region while
    // hovered. Keeps mouse-leave from firing when the cursor passes between cards.
    [bottom ? 'paddingTop' : 'paddingBottom']: hovered ? expandedExtent : 0,
  };

  if (global) {
    wrapperStyle.position = 'fixed';
    wrapperStyle.zIndex = ZINDEX.TOAST;
    if (center) {
      wrapperStyle.left = '50%';
      wrapperStyle.transform = 'translateX(-50%)';
    } else {
      wrapperStyle[right ? 'right' : 'left'] = 16;
    }
    wrapperStyle[bottom ? 'bottom' : 'top'] = 16;
  }

  if (N === 0) return null;

  // Scale toward the alignment edge so that edge stays put and only the
  // opposite/inner edges visibly shrink.
  const originX = center ? 'center' : right ? 'right' : 'left';
  const transformOrigin = `${originX} ${bottom ? 'bottom' : 'top'}`;

  return (
    <div style={wrapperStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {items.map((item, i) => {
        const ageIdx = newestIdx - i;
        const isNewest = ageIdx === 0;
        const visibleAge = Math.min(ageIdx, maxVisible);
        const beyondVisible = ageIdx > maxVisible && !hovered;

        let translateY = 0;
        let scale = 1;

        if (!isNewest) {
          if (hovered) {
            let sum = 0;
            for (let j = i + 1; j <= newestIdx; j++) sum += (heights[j] || 0) + gap;
            translateY = sign * sum;
          } else {
            translateY = sign * visibleAge * peek;
            scale = Math.max(0.5, 1 - visibleAge * scaleStep);
          }
        }

        const cardStyle: React.CSSProperties = {
          gridArea: 'stack',
          transform: `translateY(${translateY}px) scale(${scale})`,
          transformOrigin,
          transition: TRANSITION,
          zIndex: N - ageIdx,
          opacity: beyondVisible ? 0 : 1,
          pointerEvents: beyondVisible ? 'none' : undefined,
          willChange: 'transform',
        };

        const reactKey = React.isValidElement(item) ? (item.key ?? i) : i;
        return (
          <div
            key={reactKey}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={cardStyle}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};
