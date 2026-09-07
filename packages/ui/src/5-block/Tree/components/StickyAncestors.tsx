import * as React from 'react';
import {useSyncStore} from '../../../hooks/useSyncStore';
import {useStyles} from '../../../styles/context';
import {useTree} from '../context';
import {stickyClass} from '../styles';
import {TreeRow} from './TreeRow';

export interface StickyAncestorsProps {
  /**
   * The scroll content wrapper. Its `translateY` is set imperatively to the overlay
   * height so the content is pushed down by exactly the pinned height (non-
   * overlapping): a newly-pinned ancestor grows into reserved space rather than
   * covering the row below it.
   */
  pushRef: React.RefObject<HTMLDivElement | null>;
}

/** Pinned ancestor rows. */
export const StickyAncestors: React.FC<StickyAncestorsProps> = ({pushRef}) => {
  const state = useTree();
  const styles = useStyles();
  const scrollTop = useSyncStore(state.scroll.scrollTop$);
  state.rows.use();
  const rowHeight = state.rowHeight$.use();
  const max = state.stickyMax$.use();

  const {rows, height} = state.stickyLayout(scrollTop, rowHeight, max);

  React.useLayoutEffect(() => {
    const el = pushRef.current;
    if (el) el.style.transform = height > 0 ? `translateY(${height}px)` : '';
  });

  React.useLayoutEffect(
    () => () => {
      const el = pushRef.current;
      if (el) el.style.transform = '';
    },
    [pushRef],
  );

  const count = Math.floor(height / rowHeight + 0.01);
  if (count < 1) return null;
  const overlayHeight = count * rowHeight;

  return (
    <div
      className={stickyClass}
      aria-hidden
      style={{height: overlayHeight, overflow: 'hidden', background: styles.bg + ''}}
    >
      {rows.slice(0, count).map((row, i) => (
        <div key={`sticky-${row.node.id}`} style={{position: 'absolute', top: i * rowHeight, left: 0, right: 0}}>
          <TreeRow row={row} sticky />
        </div>
      ))}
    </div>
  );
};
