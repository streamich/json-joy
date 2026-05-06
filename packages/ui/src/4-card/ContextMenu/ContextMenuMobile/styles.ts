import {drule, rule} from 'nano-theme';

export const sheetClass = drule({
  pos: 'fixed',
  left: 0,
  right: 0,
  bottom: '8px',
  marginInline: 'auto',
  width: 'fit-content',
  maxWidth: '560px',
  d: 'flex',
  flexDirection: 'column',
  bdrad: '14px',
  out: 'none',
  ov: 'hidden',
  zIndex: 9999,
  maxHeight: 'calc(100vh - 24px)',
});

export const overlayClass = rule({
  pos: 'fixed',
  inset: 0,
  bg: 'rgba(0, 0, 0, .35)',
  zIndex: 9998,
});

export const handleAreaClass = rule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pad: '8px 0 4px',
  flexShrink: 0,
});

export const paneClass = drule({
  pos: 'relative',
  d: 'flex',
  flexDirection: 'column',
  flex: 1,
  ov: 'hidden',
});

export const headerClass = drule({
  d: 'flex',
  alignItems: 'center',
  gap: '8px',
  pad: '6px 12px',
  minHeight: '44px',
  bxz: 'border-box',
  flexShrink: 0,
  bdb: '1px solid transparent',
});

export const headerTitleClass = drule({
  flex: 1,
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ta: 'center',
  fz: '15px',
  fw: 600,
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
});

export const listClass = drule({
  flex: 1,
  ov: 'auto',
  WebkitOverflowScrolling: 'touch',
  overscrollBehavior: 'contain',
  pad: '4px 0 16px',
});

export const itemRowClass = drule({
  d: 'flex',
  alignItems: 'center',
  width: '320px',
  bxz: 'border-box',
  pad: '12px 16px',
  bd: 0,
  bg: 'transparent',
  out: 'none',
  ta: 'start',
  cur: 'pointer',
  fz: '15px',
  minHeight: '48px',
  '&:active': {
    bg: 'rgba(0,0,0,.06)',
  },
});

export const itemIconClass = rule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '24px',
  h: '24px',
  marginInlineEnd: '14px',
  flexShrink: 0,
});

export const itemMainClass = rule({
  flex: 1,
  d: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

export const itemLabelClass = rule({
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const itemDescriptionClass = drule({
  fz: '12px',
  marginTop: '2px',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const itemRightClass = rule({
  marginInlineStart: '12px',
  d: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

export const itemKeysClass = drule({
  marginInlineStart: '12px',
  d: 'flex',
  gap: '4px',
  flexShrink: 0,
  fz: '11px',
});

export const keyChipClass = drule({
  d: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  pad: '2px 6px',
  bdrad: '4px',
  fz: '11px',
});

export const chevronClass = rule({
  marginInlineStart: '8px',
  d: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  op: 0.5,
});

export const sectionTitleClass = drule({
  pad: '14px 16px 6px',
  fz: '12px',
  fw: 600,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
});

export const separatorClass = drule({
  h: '1px',
  mar: '6px 0',
});

export const visuallyHiddenClass = rule({
  pos: 'absolute',
  w: '1px',
  h: '1px',
  pad: 0,
  mar: '-1px',
  ov: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  bd: 0,
});
