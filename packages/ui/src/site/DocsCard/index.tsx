import * as React from 'react';
import {drule, rule, theme} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Paper} from '../../4-card/Paper';
import {Link} from '../../1-inline/Link';
import {Iconista} from '../../icons/Iconista';
import {MiniTitle} from '../../3-list-item/MiniTitle';
import {Pill} from '../../1-inline/Pill';

const blockClass = drule({
  pos: 'relative',
  d: 'flex',
  flexDirection: 'column',
  jc: 'space-between',
  h: '210px',
  bxz: 'border-box',
  pad: '24px',
  mar: '18px',
  outline: '1.5px solid transparent',
  trs: 'box-shadow .2s ease, outline-color .2s ease',
  '&:active': {
    tr: 'scale(0.99)',
  },
});

const rowClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
});

const eyebrowClass = rule({
  d: 'inline-flex',
  ai: 'center',
  lh: 1,
  gap: '7px',
  svg: {d: 'block'},
  '& > span': {lh: 1},
});

const titleClass = rule({
  ...theme.font.display.bold,
  fz: '20px',
  lh: '1.3em',
  mar: '18px 0 0',
  pad: 0,
});

const descClass = rule({
  ...theme.font.display.lite,
  fz: '14px',
  lh: '1.6em',
  pad: '10px 0 0',
  mar: 0,
});

const techClass = rule({
  ...theme.font.display.mid,
  d: 'inline-flex',
  ai: 'center',
  gap: '6px',
  fz: '12px',
  svg: {d: 'block', fill: 'currentColor'},
});

const ctaClass = drule({
  ...theme.font.ui3.mid,
  fz: '12px',
  a: {
    d: 'inline-flex',
    ai: 'center',
    td: 'none',
    svg: {
      marl: '6px',
      trs: 'transform .2s',
    },
    '&:hover': {
      td: 'none',
      svg: {transform: 'translate(6px,0)'},
    },
    '&::before': {
      pos: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      z: 1,
      pointerEvents: 'auto',
      content: '""',
      bg: 'transparent !important',
    },
  },
});

export type DocsCardType = 'doc' | 'spec' | 'lib' | 'playground';

export interface DocsCardProps {
  title: React.ReactNode;
  to: string;
  /** CTA label shown bottom-left. */
  toTitle?: React.ReactNode;
  /** Override the type icon (top-left). */
  icon?: React.ReactElement;
  type?: DocsCardType;
  /** Status badge, e.g. "working draft" (top-right). */
  status?: string;
  /** Language/technology, e.g. "TypeScript", "Node.js", "Web" (bottom-right). */
  tech?: React.ReactNode;
  /** Logo paired with `tech` (bottom-right). */
  techLogo?: React.ReactElement;
  tall?: boolean;
  /** Explicit card height (px). Overrides `tall`/default. */
  height?: number;
  /** Clip children to the card's rounded box (for bleed/peek graphics). */
  clip?: boolean;
  children?: React.ReactNode;
}

const typeMeta = (type: DocsCardType): {icon: React.ReactElement; label: string} => {
  switch (type) {
    case 'doc':
      return {icon: <Iconista set="atlaskit" icon="document-filled" width={16} height={16} />, label: 'Document'};
    case 'lib':
      return {icon: <Iconista set="elastic" icon="editor_code_block" width={16} height={16} />, label: 'Library'};
    case 'spec':
      return {icon: <Iconista set="lucide" icon="book" width={16} height={16} />, label: 'Specification'};
    case 'playground':
      return {icon: <Iconista set="elastic" icon="play" width={16} height={16} />, label: 'Playground'};
  }
};

export const DocsCard: React.FC<DocsCardProps> = ({
  to,
  toTitle = 'Read more',
  title,
  icon,
  type,
  status,
  tech,
  techLogo,
  tall,
  height,
  clip,
  children,
}) => {
  const styles = useStyles();
  const ctaCol = '' + styles.g(0.3);

  const blockCls = blockClass({});
  const ctaCls = ctaClass({
    a: {
      col: ctaCol,
      svg: {fill: ctaCol, col: ctaCol},
      '&:hover': {col: '#07f', svg: {fill: '#07f', col: '#07f'}},
    },
  });

  const meta = type ? typeMeta(type) : null;
  const tileIcon = icon ?? meta?.icon ?? null;
  const eyebrow = meta?.label;

  const style: React.CSSProperties = {
    backgroundColor: '#fff',
  };
  if (height !== undefined) style.height = height;
  else if (tall) style.height = 260;
  if (clip) style.overflow = 'hidden';

  return (
    <Paper round hover hoverElevate contrast className={blockCls} style={style}>
      <div>
        {(!!tileIcon || !!eyebrow || !!status) && (
          <div className={rowClass}>
            <span className={eyebrowClass} style={{color: styles.g(0.42)}}>
              {tileIcon}
              {!!eyebrow && <MiniTitle>{eyebrow}</MiniTitle>}
            </span>
            {!!status && (
              <Pill small color="neutral" solid>
                {status}
              </Pill>
            )}
          </div>
        )}
        <h2 className={titleClass} style={{color: styles.g(0.08)}}>
          {title}
        </h2>
        {!!children && (
          <div className={descClass} style={{color: styles.g(0.3)}}>
            {children}
          </div>
        )}
      </div>
      <div className={rowClass}>
        <div className={ctaCls}>
          <Link a to={to}>
            {toTitle}
            <Iconista set="ibm_16" icon="arrow--right" width={16} height={16} />
          </Link>
        </div>
        {(!!tech || !!techLogo) && (
          <span className={techClass} style={{color: styles.g(0.42)}}>
            {techLogo}
            {tech}
          </span>
        )}
      </div>
    </Paper>
  );
};

export default DocsCard;
