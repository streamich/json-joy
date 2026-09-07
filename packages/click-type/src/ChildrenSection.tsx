import Arrow from '@jsonjoy.com/ui/lib/icons/interactive/Arrow';
import {rule} from 'nano-theme';
import * as React from 'react';
import {useExpandAll, usePointer} from './context';

const blockCls = rule({
  d: 'block',
  pd: 0,
  mr: 0,
});

const headerCls = rule({
  d: 'inline-block',
  cur: 'default',
  us: 'none',
  fz: '0.85em',
  lh: '1.1em',
  col: 'var(--ct-label)',
  '&:hover': {col: 'var(--ct-accent)'},
});

const triCls = rule({
  d: 'inline-block',
  pos: 'relative',
  l: '-3px',
  t: '1px',
  w: '12px',
  fz: '9px',
  va: 'middle',
  col: 'var(--ct-toggle)',
});

const labelCls = rule({
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fz: '.9em',
  col: 'var(--ct-dim)',
});

const previewCls = rule({
  d: 'inline-block',
  mrl: '6px',
  va: 'top',
});

const childrenCls = rule({
  d: 'block',
  pos: 'relative',
  mrl: '2px',
  pd: '0 0 0 8px',
  // Connector line drawn as a pseudo-element so it can stop short of the bottom.
  '&::before': {
    content: '""',
    pos: 'absolute',
    l: 0,
    t: '1px',
    b: '8px',
    bdl: '1px dotted var(--ct-line)',
  },
});

export interface ChildrenSectionProps {
  /** Section label, e.g. `keys`, `variants`, `elements`. */
  label?: React.ReactNode;
  /** Shown to the right of the label while the section is collapsed (e.g. an array's element preview). */
  collapsedPreview?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A composite type's children list, collapsible independently of the node's own
 * options/metadata (defaults to open). This is what gives `obj` & friends a
 * third state: node-collapsed, node-expanded-with-children-hidden, and fully
 * expanded. When collapsed, an optional {@link collapsedPreview} renders beside
 * the label.
 */
export const ChildrenSection: React.FC<ChildrenSectionProps> = ({label, collapsedPreview, children: body}) => {
  const [open, setOpen] = React.useState(true);
  useExpandAll(usePointer(), setOpen);
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((o) => !o);
  };

  return (
    <span className={blockCls}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is managed at the FocusProvider level */}
      <span className={headerCls} onClick={onClick}>
        <span className={triCls}>
          <Arrow direction={open ? 'd' : 'r'} size={11} />
        </span>
        <span className={labelCls}>{label ?? 'children'}</span>
      </span>
      {!open && collapsedPreview ? <span className={previewCls}>{collapsedPreview}</span> : null}
      {open ? <span className={childrenCls}>{body}</span> : null}
    </span>
  );
};
