import Arrow from '@jsonjoy.com/ui/lib/icons/interactive/Arrow';
import {rule} from 'nano-theme';
import * as React from 'react';

const toggle = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: '13px',
  h: '13px',
  mr: '0 0 0 -13px',
  va: 'middle',
  fz: '10px',
  cur: 'default',
  us: 'none',
  ta: 'center',
  col: 'var(--ct-toggle)',
  '&:hover': {col: 'var(--ct-accent)'},
});

export interface CollapseToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

/** A small triangle that expands/collapses a node's children. */
export const CollapseToggle: React.FC<CollapseToggleProps> = ({collapsed, onToggle}) => {
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is managed at the FocusProvider level
    <span className={toggle} onClick={onClick}>
      <Arrow direction={collapsed ? 'r' : 'd'} size={13} />
    </span>
  );
};
