import {fonts} from '../../styles/font';
import {rule} from 'nano-theme';

export const treeWrapClass = rule({
  fl: '1',
  pos: 'relative',
  ov: 'hidden',
});

export const scrollerClass = rule({
  w: '100%',
  h: '100%',
  bxz: 'border-box',
  ovy: 'scroll',
  outline: 'none',
  scrollbarWidth: 'none',
  MsOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    d: 'none',
  },
  '& .tree-guides-hover': {
    op: '0',
    trs: 'opacity .12s',
  },
  '&:hover .tree-guides-hover': {
    op: '1',
  },
});

export const rowClass = rule({
  pos: 'relative',
  // Own stacking context so the rounded highlight `::before` (z-index -1) sits
  // behind the row content but in front of the row background.
  isolation: 'isolate',
  d: 'flex',
  alignItems: 'center',
  bxz: 'border-box',
  w: '100%',
  cursor: 'default',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  // Hover-revealed action buttons (per-row).
  '& .tree-actions': {
    op: '0',
    trs: 'opacity .12s',
  },
  '&:hover .tree-actions': {
    op: '1',
  },
  '&::before': {
    content: '""',
    pos: 'absolute',
    inset: '0',
    bdrad: '4px',
    trs: 'background .15s, box-shadow .15s',
    pointerEvents: 'none',
    z: -1,
  },
});

export const stickyClass = rule({
  pos: 'absolute',
  t: '0',
  l: '0',
  r: '0',
  boxShadow: '0 2px 6px -3px rgba(0,0,0,0.28)',
});

export const guidesClass = rule({
  pos: 'absolute',
  top: '0',
  left: '0',
  bottom: '0',
  pointerEvents: 'none',
});

export const chevronClass = rule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
  cursor: 'pointer',
  trs: 'transform .12s ease',
  '& svg': {
    d: 'block',
  },
});

export const iconCellClass = rule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
});

export const nameCellClass = rule({
  ...fonts.get('ui', 'mid', 0),
  fz: '13px',
  fl: '1',
  minWidth: '0',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/** A clickable folder segment in a compressed `a / b / c` chain. */
export const chainSegClass = rule({
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
});

/** The dim `/` separator between compressed-chain segments. */
export const chainSepClass = rule({
  op: '0.4',
  margin: '0 0.35em',
});

export const rightCellClass = rule({
  d: 'flex',
  alignItems: 'center',
  flexShrink: '0',
  gap: '4px',
  // Breathing room between decorations and the row's right edge / action buttons.
  marginRight: '6px',
});

export const actionsClass = rule({
  d: 'flex',
  alignItems: 'center',
  flexShrink: '0',
});

export const decorationBadgeClass = rule({
  d: 'inline-flex',
  alignItems: 'center',
  fz: '11px',
  lineHeight: '1',
  pad: '1px 5px',
  bdrad: '6px',
  flexShrink: '0',
});
