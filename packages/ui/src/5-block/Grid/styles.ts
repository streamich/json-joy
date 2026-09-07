import {rule} from 'nano-theme';
import type * as React from 'react';
import {fonts} from '../../styles/font';
import {GRID} from './constants';
import type {GridAlign, GridColumn} from './types';

export const gridWrapClass = rule({
  fl: '1',
  pos: 'relative',
  ov: 'hidden',
});

export const scrollerClass = rule({
  w: '100%',
  h: '100%',
  bxz: 'border-box',
  ovy: 'scroll',
  ovx: 'auto',
  outline: 'none',
  scrollbarWidth: 'none',
  MsOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    d: 'none',
  },
});

/** Header + row canvas; `minWidth` is set inline to the resolved total column width. */
export const contentClass = rule({
  pos: 'relative',
  bxz: 'border-box',
});

export const headerClass = rule({
  pos: 'sticky',
  top: '0',
  z: 2,
  d: 'flex',
  alignItems: 'stretch',
  bxz: 'border-box',
  w: '100%',
  userSelect: 'none',
});

export const headerCellClass = rule({
  ...fonts.get('ui', 'mid', 0),
  fz: '12px',
  fw: '600',
  // Anchors the absolutely-positioned resize handle at the cell's right edge.
  pos: 'relative',
  d: 'flex',
  alignItems: 'center',
  gap: `${GRID.HeaderGap}px`,
  bxz: 'border-box',
  pad: `0 var(--jj-grid-pad, ${GRID.CellPad}px)`,
  minWidth: '0',
});

export const rowClass = rule({
  pos: 'relative',
  d: 'flex',
  alignItems: 'stretch',
  bxz: 'border-box',
  w: '100%',
});

export const cellClass = rule({
  ...fonts.get('ui', 'mid', 0),
  fz: '13px',
  d: 'flex',
  alignItems: 'center',
  bxz: 'border-box',
  pad: `0 var(--jj-grid-pad, ${GRID.CellPad}px)`,
  minWidth: '0',
  ov: 'hidden',
});

export const cellActiveClass = rule({
  bxsh: 'inset 0 0 0 1px var(--colAccent)',
  bdrad: '4px',
  '&:hover': {
    bxsh: 'inset 0 0 0 2px var(--colAccent)',
  },
});

/** Inner value wrapper — the flex item that actually truncates with an ellipsis. */
export const cellTextClass = rule({
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/** Multi-sort priority badge next to the sort arrow. */
export const sortBadgeClass = rule({
  fz: '10px',
  lineHeight: '1',
  pad: '1px 4px',
  bdrad: '4px',
  flexShrink: '0',
});

export const emptyClass = rule({
  ...fonts.get('ui', 'mid', 0),
  fz: '13px',
  fontStyle: 'italic',
  pad: '16px',
});

/** Flex sizing shared by a column's header and body cells, so they stay aligned. */
export const cellSizeStyle = (column: GridColumn<any, any>): React.CSSProperties => ({
  flexGrow: column.flex,
  flexShrink: 0,
  flexBasis: column.width,
  minWidth: column.minWidth,
});

export const justifyOf = (align: GridAlign): React.CSSProperties['justifyContent'] =>
  align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
