import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {MiniTitle} from '../../../3-list-item/MiniTitle';
import Arrow from '../../../icons/interactive/Arrow';
import {Ripple} from '../../../misc/Ripple';
import {useStyles} from '../../../styles/context';
import type {MenuItem} from '../../StructuralMenu/types';

const blockClass = rule({
  d: 'block',
  pad: '10px 22px 4px',
});

const compactClass = rule({
  d: 'flex',
  ai: 'center',
  pad: '10px 22px 8px',
});

const interactiveClass = rule({
  bd: 0,
  bg: 'transparent',
  w: '100%',
  ta: 'inherit',
  mar: 0,
  out: 'none',
  pos: 'relative',
  isolation: 'isolate',
  WebkitTapHighlightColor: 'transparent',
  '&:focus': {out: 'none'},
  '&:before': {
    content: '""',
    pos: 'absolute',
    top: 0,
    right: '2px',
    bottom: 0,
    left: '2px',
    bdrad: '4px',
    bg: 'transparent',
    trs: 'background .12s, box-shadow .12s',
    pe: 'none',
    z: -1,
  },
  '&:hover:before': {
    bg: 'rgba(127,127,127,0.06)',
  },
  '&:active:before': {
    bg: 'rgba(127,127,127,0.1)',
  },
  '&:focus:not(:focus-visible):before': {
    bxsh: 'none',
  },
  '&:focus-visible:before': {
    bxsh: '0 0 0 2px rgba(0,137,255,0.6)',
  },
});

const chevronClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: '14px',
  h: '14px',
  flexShrink: 0,
  marginInlineStart: '-4px',
});

export interface ContextMenuHeadingProps {
  item: MenuItem;
  /** Tighter vertical padding for dense panes. */
  compact?: boolean;
  /** Whether this collapsible heading is currently collapsed. */
  collapsed?: boolean;
  /** Fired when the heading is clicked (only when `item.collapsible`). */
  onToggle?: () => void;
}

export const ContextMenuHeading: React.FC<ContextMenuHeadingProps> = ({item, compact, collapsed, onToggle}) => {
  const [t] = useT();
  const styles = useStyles();
  const label = item.display?.() ?? t(item.name);
  const collapsible = !!item.collapsible && !!onToggle;
  const titleStyle: React.CSSProperties | undefined = item.danger ? {color: styles.col.get('error')} : undefined;

  if (!compact) {
    return (
      <div className={blockClass} role="presentation">
        <MiniTitle style={titleStyle}>{label}</MiniTitle>
      </div>
    );
  }

  const inner = (
    <>
      {collapsible && (
        <span className={chevronClass} style={{color: styles.g(0.5)}}>
          <Arrow direction={collapsed ? 'r' : 'd'} style={{width: 12, height: 12}} />
        </span>
      )}
      <MiniTitle style={{marginInlineStart: 'auto', ...titleStyle}}>{label}</MiniTitle>
    </>
  );

  if (collapsible) {
    return (
      <Ripple>
        <button type="button" className={compactClass + interactiveClass} aria-expanded={!collapsed} onClick={onToggle}>
          {inner}
        </button>
      </Ripple>
    );
  }

  return (
    <div className={compactClass} role="presentation">
      {inner}
    </div>
  );
};
