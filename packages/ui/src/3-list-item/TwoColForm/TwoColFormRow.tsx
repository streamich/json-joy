import * as React from 'react';
import {theme, rule, useRule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const rowClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
  w: '100%',
  bxz: 'border-box',
  pd: '0',
  minHeight: '32px',
  '&+&': {
    mrt: '4px',
  },
});

const leftClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '10px',
  flex: '1 1 auto',
  minWidth: 0,
});

const iconClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
  w: '16px',
  h: '16px',
});

const labelClass = rule({
  ...theme.font.ui1.mid,
  fz: '14px',
  lh: '20px',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
});

const rightClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'flex-end',
  gap: '6px',
  flex: '0 1 auto',
  minWidth: 0,
  ta: 'right',
});

export interface TwoColFormRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional small icon shown before the label. */
  icon?: React.ReactNode;
  /** Left-side label (key). */
  title: React.ReactNode;
  /** Right-side value or control. */
  children?: React.ReactNode;
  /** Visually mute the row (e.g. for disabled rows). */
  muted?: boolean;
}

export const TwoColFormRow: React.FC<TwoColFormRowProps> = ({icon, title, children, muted, ...rest}) => {
  const styles = useStyles();

  const dynamicLabelClass = useRule(() => ({
    col: muted ? styles.g(0.55) : styles.g(0.25),
  }));

  const dynamicIconClass = useRule(() => ({
    col: muted ? styles.g(0.6) : styles.g(0.45),
  }));

  const dynamicRightClass = useRule(() => ({
    col: muted ? styles.g(0.55) : styles.g(0.35),
  }));

  return (
    <div className={(rest.className ? ` ${rest.className}` : '') + rowClass} {...rest}>
      <span className={leftClass}>
        {!!icon && <span className={iconClass + dynamicIconClass}>{icon}</span>}
        <span className={labelClass + dynamicLabelClass}>{title}</span>
      </span>
      {children !== undefined && children !== null && children !== false && (
        <span className={rightClass + dynamicRightClass}>{children}</span>
      )}
    </div>
  );
};
