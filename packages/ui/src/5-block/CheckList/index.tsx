import * as React from 'react';
import {rule, drule, theme} from 'nano-theme';
import {Iconista} from '../../icons/Iconista';
import {useStyles} from '../../styles/context';

const listCls = rule({
  listStyle: 'none',
  mar: 0,
  pd: 0,
});

const flowCls = rule({
  d: 'flex',
  flexDirection: 'column',
});

const itemCls = rule({
  ...theme.font.ui2.mid,
  d: 'flex',
  alignItems: 'center',
  gap: '12px',
  fz: '17px',
  lh: '1.4em',
});

const badgeCls = rule({
  d: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  w: '22px',
  h: '22px',
  bdrad: '50%',
});

const multicolClass = drule({});

export interface CheckListProps {
  /** List entries, each shown next to a check badge. */
  items: React.ReactNode[];
  /** Accent color for the check badges. Defaults to the theme success green. */
  color?: string;
  /** Lay the items out across this many CSS columns. Default 1. */
  columns?: number;
  /** Gap between columns when {@link columns} is greater than 1. Default 40px. */
  columnGap?: number | string;
  /** Vertical gap between rows. Default 16px. */
  gap?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Vertical (or multi-column) checklist: each item sits next to a round badge
 * holding a checkmark, tinted by {@link CheckListProps.color}.
 */
export const CheckList: React.FC<CheckListProps> = ({
  items,
  color,
  columns = 1,
  columnGap = 40,
  gap = 16,
  className = '',
  style,
}) => {
  const styles = useStyles();
  const accent = color ?? '' + styles.col.get('success');
  const accentSoft = `color-mix(in srgb, ${accent} 12%, transparent)`;
  const multicol = columns > 1;
  const badgeStyle: React.CSSProperties = {background: accentSoft, color: accent};
  const multicolCls = multicol
    ? multicolClass({
        columnCount: columns,
        columnGap: typeof columnGap === 'number' ? columnGap + 'px' : columnGap,
        '@media only screen and (max-width: 600px)': {columnCount: 1},
      })
    : '';
  const listStyle: React.CSSProperties = multicol ? (style ?? {}) : {gap, ...style};
  const itemStyle: React.CSSProperties | undefined = multicol ? {paddingBottom: gap, breakInside: 'avoid'} : undefined;

  return (
    <ul className={className + listCls + (multicol ? multicolCls : flowCls)} style={listStyle}>
      {items.map((item, i) => (
        <li key={i} className={itemCls} style={itemStyle}>
          <span className={badgeCls} style={badgeStyle}>
            <Iconista set="ibm_32" icon="checkmark" width={16} height={16} color={accent} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
};

export default CheckList;
