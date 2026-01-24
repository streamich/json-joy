import * as React from 'react';
import {drule, theme} from 'nano-theme';
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
  const noClick = !rest.to && !rest.onClick;
  const style: React.CSSProperties = {
    fontSize: compact ? '11px' : '13px',
    padding: compact ? '2px 4px' : '4px 8px',
  };
  const className = blockClass(
    compact
      ? {
          cur: rest.to ? 'pointer' : 'default',
          ...(compact ? theme.font.ui2.mid : theme.font.ui2.bold),
          col: selected ? theme.blue(0.9) : theme.g(0.5),
          bg: selected ? theme.blue(0.12) : 'transparent',
          '&:hover': {
            col: noClick ? theme.g(0.5) : theme.color.sem.positive[1],
            bg: noClick ? 'transparent' : theme.green(0.12),
          },
        }
      : {},
  );

  if (noClick) {
    return (
      <span className={(rest.className ?? '') + className} style={style}>
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
