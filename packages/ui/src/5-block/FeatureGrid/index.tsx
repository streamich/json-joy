import * as React from 'react';
import {lightTheme as theme, rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Link} from '../../1-inline/Link';
import {Label} from '../../1-inline/Label';
import {Tilt} from '../../4-card/Tilt';
import {Iconista} from '../../icons/Iconista';

export type FeatureBadgeTone = 'new' | 'beta' | 'roadmap' | 'pro' | 'neutral';

export interface FeatureBadge {
  label: React.ReactNode;
  tone?: FeatureBadgeTone;
}

export interface FeatureCard {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  iconAlign?: 'left' | 'right';
  /** Keyboard hint chip on the title row. Wins the right slot over the icon. */
  kbd?: React.ReactNode;
  badge?: FeatureBadge;
  /** Makes the whole tile a link. Wins over `footerLink`. */
  href?: string;
  footerLink?: {label: React.ReactNode; href: string};
  /** Bento span. Applies at >= 2 columns, collapses to 1 on small screens. */
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}

export type FeatureGridColumns = Partial<Record<'sm' | 'md' | 'lg' | 'xl', number>>;

export interface FeatureGridProps {
  columns?: FeatureGridColumns;
  density?: 'comfortable' | 'compact';
  cards: FeatureCard[];
}

const DEFAULT_COLUMNS: Required<FeatureGridColumns> = {sm: 1, md: 2, lg: 3, xl: 4};

const pickColumns = (width: number, override?: FeatureGridColumns): number => {
  const c = {...DEFAULT_COLUMNS, ...override};
  if (width < 640) return c.sm;
  if (width < 960) return c.md;
  if (width < 1280) return c.lg;
  return c.xl;
};

const gridClass = rule({
  d: 'grid',
  w: '100%',
  bxz: 'border-box',
});

const linkResetClass = rule({
  d: 'block',
  h: '100%',
  td: 'none',
  col: 'inherit',
  '&:hover': {td: 'none'},
});

const cardClass = drule({
  pos: 'relative',
  d: 'flex',
  flexDirection: 'column',
  bxz: 'border-box',
  h: '100%',
  bdrad: '18px',
  trs: 'box-shadow .25s ease',
  h3: {
    ...theme.font.display.bold,
    fz: '20px',
    lh: '1.15em',
    letterSpacing: '-.01em',
    mar: 0,
    pad: 0,
    padr: '8px',
  },
});

const cornerClass = rule({
  pos: 'absolute',
  top: '14px',
  right: '14px',
  d: 'flex',
  flexDirection: 'column',
  ai: 'flex-end',
  gap: '8px',
});

const iconClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
});

const cornerBottomClass = rule({
  pos: 'absolute',
  bottom: '14px',
  right: '14px',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  pointerEvents: 'none',
});

const descClass = rule({
  ...theme.font.ui1.mid,
  fz: '13px',
  lh: '1.45em',
  letterSpacing: '-.005em',
  mar: '14px 0 0',
  pad: 0,
});

const kbdClass = rule({
  ...theme.font.mono.mid,
  d: 'inline-flex',
  ai: 'center',
  flex: '0 0 auto',
  fz: '12px',
  lh: 1,
  pad: '4px 6px',
  bdrad: '5px',
});

const badgeLabelClass = rule({
  ...theme.font.ui3.bold,
  fz: '10px',
  lh: 1,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
});

const footerClass = drule({
  ...theme.font.ui1.lite,
  mar: 'auto 0 0',
  pad: '16px 0 0',
  a: {
    d: 'inline-flex',
    ai: 'center',
    td: 'none',
    ...theme.font.ui1.lite,
    fz: '13px',
    svg: {marl: '6px', trs: 'transform .2s'},
    '&:hover': {td: 'none', svg: {transform: 'translate(6px,0)'}},
  },
});

export const FeatureGrid: React.FC<FeatureGridProps> = ({columns, density = 'comfortable', cards}) => {
  const {width} = useWindowSize();
  const styles = useStyles();

  const cols = pickColumns(width, columns);
  const compact = density === 'compact';
  const pad = compact ? 20 : 28;
  const gap = compact ? 18 : 28;
  const fxOff = width < 640;

  const footerCol = '' + styles.g(0.3);
  const g = styles.grey.fg;
  const baseGrad = styles.g(0, 0.04);
  const iconCol = '' + g.pct(0, -0.44, 0.05, -0.5);

  const cardCls = cardClass({
    bg: baseGrad,
    ['--fg-icon' as any]: iconCol,
    ['--fg-icon-2' as any]: iconCol,
    h3: {col: styles.g(0.05)},
    p: {col: styles.g(0.5)},
    bd: '1px solid transparent',
    '&:hover': {
      bg: '#1c1c1c',
      bd: '1px solid ' + styles.grey.fg.pct(0, 0, 0, 0.2),
      h3: {col: '#fff'},
      p: {col: 'rgba(255,255,255,.72)'},
      a: {col: '#fff', svg: {fill: '#fff'}},
      ['--fg-icon' as any]: 'rgba(255,255,255,.5)',
      ['--fg-icon-2' as any]: 'rgba(255,255,255)',
    },
  });

  return (
    <div className={gridClass} style={{gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap}}>
      {cards.map((card, i) => {
        const linked = !!card.href;
        const span = cols > 1 ? Math.min(card.colSpan ?? 1, cols) : 1;
        const rowSpan = cols > 1 ? (card.rowSpan ?? 1) : 1;
        const tinted = !card.badge?.tone || card.badge.tone === 'roadmap' || card.badge.tone === 'neutral';
        const hasCorner = !!card.icon || !!card.kbd || !!card.badge;

        const iconNode = React.isValidElement(card.icon)
          ? React.cloneElement(card.icon as React.ReactElement<{color?: string}>, {color: 'var(--fg-icon)'})
          : card.icon;

        const inner = (
          <>
            {hasCorner && (
              <div className={cornerClass}>
                {!!card.icon && <span className={iconClass}>{iconNode}</span>}
                {!!card.kbd && (
                  <span className={kbdClass} style={{background: styles.g(0, 0.05), color: styles.g(0.4)}}>
                    {card.kbd}
                  </span>
                )}
                {!!card.badge && (
                  <Label tint={tinted} className={badgeLabelClass}>
                    {card.badge.label}
                  </Label>
                )}
              </div>
            )}
            <h3>{card.title}</h3>
            {!!card.description && (!compact || width >= 640) && <p className={descClass}>{card.description}</p>}
            {!!card.footerLink && (
              <div className={footerClass({a: {col: footerCol, svg: {fill: footerCol}}})}>
                <Link a to={card.footerLink.href}>
                  {card.footerLink.label}
                  <Iconista set="ibm_16" icon="arrow--right" width={14} height={14} />
                </Link>
              </div>
            )}
            {linked && (
              <span className={cornerBottomClass}>
                <Iconista
                  set={'lucide' as any}
                  icon={'arrow-up-right' as any}
                  width={16}
                  height={16}
                  color="var(--fg-icon-2)"
                />
              </span>
            )}
          </>
        );

        const cellStyle: React.CSSProperties = {
          display: 'block',
          height: '100%',
          gridColumn: span > 1 ? `span ${span}` : undefined,
          gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
        };

        const cardEl = (
          <div
            className={cardCls}
            // style={{padding: pad, ['--fg-card-bd' as any]: bd[i % bd.length].fg.pct(0, -.8, -0.3) + ''} as React.CSSProperties}
            style={{padding: pad}}
            // borderRadius={18}
            // thickness={3}
            // color={'rgba(127,127,127,.5)'}
            // color={borderCursor}
            // color={bd[i % bd.length].fg.pct(0, 0.4, 0.3, -.9) + ''}
            // ambientColor="transparent"
            // radius={220}
            // reach={333}
          >
            {inner}
          </div>
        );

        return (
          <Tilt key={i} max={12} perspective={900} disabled={fxOff} style={cellStyle}>
            {/* <div key={i} style={cellStyle}> */}
            {linked ? (
              <Link a to={card.href!} className={linkResetClass}>
                {cardEl}
              </Link>
            ) : (
              cardEl
            )}
          </Tilt>
          // {/* </div> */}
        );
      })}
    </div>
  );
};

export default FeatureGrid;
