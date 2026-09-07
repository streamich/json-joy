import {drule, rule} from 'nano-theme';
import * as React from 'react';
import {useSyncStore} from '../../../hooks/useSyncStore';
import {useStyles} from '../../../styles/context';
import {GRID} from '../constants';
import {useGrid} from '../context';
import {columnLabel} from '../state';
import type {GridColumn} from '../types';

const blockClass = rule({
  pos: 'absolute',
  top: '0',
  right: '0',
  w: `${GRID.ResizeHitArea}px`,
  h: '100%',
  bxz: 'border-box',
  us: 'none',
  cur: 'col-resize',
  touchAction: 'none',
  z: 3,
  '&:focus': {
    out: 'none',
  },
});

// The SlimDivider treatment: a hairline that becomes an inset, boundary-
// centered handle pill on hover and, on press/focus, narrows and tints with
// the accent color.
const lineClass = drule({
  pos: 'absolute',
  top: '0',
  right: '0',
  w: '1px',
  h: '100%',
  bxz: 'border-box',
  trs: 'background .3s, width .06s, top .06s, height .06s, right .06s',
  bdrad: '2px',
  [`.${blockClass.trim()}:hover &`]: {
    w: '7px',
    right: '-3px',
    top: '2px',
    h: 'calc(100% - 4px)',
  },
  [`.${blockClass.trim()}:focus &`]: {
    w: '3px',
    right: '-1px',
    top: '4px',
    h: 'calc(100% - 8px)',
    border: 'none',
  },
  [`.${blockClass.trim()}:active &`]: {
    w: '3px',
    right: '-1px',
    top: '4px',
    h: 'calc(100% - 8px)',
    border: 'none',
  },
});

const INSTRUCTIONS =
  'Use Left and Right arrow keys to resize. Hold Shift for larger steps. ' +
  'Press Home for the minimum width, End to fit content, Escape to restore.';

export interface GridResizeHandleProps {
  column: GridColumn;
}

/**
 * The column-resize handle at the right edge of a header cell. Pointer-capture
 * drag and keyboard resize are owned by {@link GridState}; while dragging, a
 * guide line extends from the boundary down the full viewport height.
 */
export const GridResizeHandle: React.FC<GridResizeHandleProps> = ({column}) => {
  const state = useGrid();
  const styles = useStyles();
  const resizingId = state.resizing$.use();
  const clientHeight = useSyncStore(state.scroll.clientHeight$);
  const dragging = resizingId === column.id;

  const accent = styles.col.accent(0, 5);
  const cls = lineClass({
    bg: styles.g(0, 0.08),
    [`.${blockClass.trim()}:hover &`]: {
      bg: styles.g(1),
      bd: `1px solid ${styles.g(0, 0.2)}`,
    },
    [`.${blockClass.trim()}:focus &`]: {
      bg: styles.g(0, 0.25),
    },
    [`.${blockClass.trim()}:active &`]: {
      bg: accent,
    },
  });

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${columnLabel(column)} column`}
      aria-valuenow={column.width}
      aria-valuemin={column.minWidth}
      aria-valuemax={column.maxWidth}
      aria-description={INSTRUCTIONS}
      tabIndex={0}
      className={blockClass}
      onPointerDown={(e) => state.onResizePointerDown(column.id, e)}
      onPointerMove={state.onResizePointerMove}
      onPointerUp={state.onResizePointerUp}
      onPointerCancel={state.onResizePointerUp}
      onLostPointerCapture={state.onResizeLostCapture}
      onKeyDown={(e) => state.onResizeKeyDown(column.id, e)}
      onBlur={state.onResizeBlur}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        e.stopPropagation();
        state.autoFitColumn(column.id);
      }}
    >
      <div
        className={cls}
        style={
          dragging
            ? {width: 3, right: -1, top: 4, height: 'calc(100% - 8px)', background: accent, border: 'none'}
            : undefined
        }
      />
      {dragging && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 1,
            height: clientHeight,
            background: accent,
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};
