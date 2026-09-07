import * as React from 'react';
import {drule} from 'nano-theme';
import {fonts} from '../../styles/font';
import {useStyles} from '../../styles/context';

const ui = fonts.get('display', 'mid');

const rowClass = drule({
  pos: 'relative',
  d: 'flex',
  ai: 'center',
  gap: '10px',
  w: '100%',
  minW: 0,
  bxz: 'border-box',
  pd: '5px 6px',
  mar: '0 -6px',
  bdrad: '8px',
  trs: 'background .14s',
});

const editableClass = drule({
  cur: 'pointer',
});

const labelWrapClass = drule({
  ...ui,
  d: 'flex',
  ai: 'center',
  gap: '8px',
  flex: '0 0 auto',
  fz: '13.5px',
  lh: '18px',
  minW: 0,
});

const labelIconClass = drule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
  w: '17px',
  h: '17px',
  '& svg': {d: 'block', w: '100%', h: '100%'},
});

const valueClass = drule({
  ...ui,
  d: 'flex',
  ai: 'center',
  jc: 'flex-end',
  gap: '6px',
  flex: '1 1 auto',
  ml: 'auto',
  minW: 0,
  fz: '13.5px',
  lh: '18px',
  ta: 'right',
  wordBreak: 'break-word',
});

const chevronClass = drule({
  d: 'inline-flex',
  flex: '0 0 auto',
  ml: '2px',
  '& svg': {d: 'block'},
});

export interface PropertyRowProps {
  /** Leading field icon (a line glyph). */
  icon?: React.ReactNode;
  /** Field label (left). */
  label: React.ReactNode;
  /** Field value (right) — plain text, a pill, a `<Chip>`, a `<Thumbnail>`, or an editor. */
  children?: React.ReactNode;
  /** Trailing control (e.g. a Download button). Shown instead of the editable chevron. */
  action?: React.ReactNode;
  /** Marks the row as editable: hover fill + trailing chevron, activates `onActivate`. */
  editable?: boolean;
  onActivate?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const Chevron: React.FC<{color: string}> = ({color}) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M4 6.5L8 10.5L12 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * One *property* (field) row — icon + label on the left, value on the right. The
 * building block of {@link CardSectionList}'s field list.
 */
export const PropertyRow: React.FC<PropertyRowProps> = ({
  icon,
  label,
  children,
  action,
  editable,
  onActivate,
  className,
  style,
}) => {
  const styles = useStyles();
  const dyn = editable ? {'&:hover': {bg: styles.g(0, 0.05)}} : {};
  const interactive = editable && !!onActivate;
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the editor activation is mirrored by the caller's own control; keyboard a11y is handled there
    <div
      className={rowClass(dyn) + (editable ? ' ' + editableClass({}) : '') + (className ? ' ' + className : '')}
      style={style}
      onClick={interactive ? onActivate : undefined}
      role={interactive ? 'button' : undefined}
    >
      <span className={labelWrapClass({col: styles.g(0.42)})}>
        {icon !== undefined && icon !== null && <span className={labelIconClass({col: styles.g(0.5)})}>{icon}</span>}
        {label}
      </span>
      <span className={valueClass({col: styles.g(0.12)})}>
        {children}
        {action !== undefined && action !== null
          ? action
          : editable && (
              <span className={chevronClass({})}>
                <Chevron color={styles.g(0.5)} />
              </span>
            )}
      </span>
    </div>
  );
};
