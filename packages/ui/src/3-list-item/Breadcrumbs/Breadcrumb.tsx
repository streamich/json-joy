import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Link, type LinkProps} from '../../1-inline/Link';

const blockClass = drule({
  fz: '15.6px',
  bdrad: '0.4em',
  lh: '1.4em',
  out: 0,
  bd: 0,
  pd: 0,
  mr: 0,
});

export interface BreadcrumbProps extends LinkProps {
  noHover?: boolean;
  compact?: boolean;
  selected?: boolean;
  children?: React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({noHover, compact, selected, children, ...rest}) => {
  const styles = useStyles();
  const noClick = !rest.to && !rest.onClick;
  const style: React.CSSProperties = {
    fontSize: compact ? '11px' : '13px',
    padding: compact ? '2px 4px' : '4px 8px',
  };
  const link = styles.col.get('link', 'solid-1');
  const linkBg = styles.col.get('link', 'bg-2');
  const positiveFg = styles.positive.fg.toString();
  const positiveBg = (
    styles.light ? styles.positive.fg.pct(0, -0.5, 0.85) : styles.positive.fg.pct(0, -0.3, -0.65)
  ).toString();
  const className = blockClass(
    compact
      ? {
          cur: rest.to ? 'pointer' : 'default',
          ...(compact ? lightTheme.font.ui2.mid : lightTheme.font.ui2.bold),
          col: selected ? link : styles.g(0.5),
          bg: selected ? linkBg : 'transparent',
          '&:hover': {
            col: noClick ? styles.g(0.5) : positiveFg,
            bg: noClick ? 'transparent' : positiveBg,
          },
        }
      : {},
  );

  if (noClick) {
    return (
      <span
        className={(rest.className ?? '') + className}
        style={style}
        onMouseDown={rest.onMouseDown as React.MouseEventHandler<HTMLSpanElement> | undefined}
      >
        {children}
      </span>
    );
  }

  return (
    <Link {...rest} a={!!rest.to} className={(rest.className ?? '') + className} style={style}>
      {children}
    </Link>
  );
};
