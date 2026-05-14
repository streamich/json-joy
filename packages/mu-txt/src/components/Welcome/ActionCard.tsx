import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {Tilt} from '@jsonjoy.com/ui/lib/4-card/Tilt';

const blockClass = drule({
  pos: 'relative',
  d: 'flex',
  fld: 'column',
  ai: 'flex-start',
  gap: '6px',
  pd: '20px 20px 18px',
  cur: 'pointer',
  ta: 'left',
  us: 'none',
  transition: 'background .15s ease, border-color .15s ease',
  overflow: 'hidden',
  w: '100%',
  h: '100%',
  minH: '128px',
  boxSizing: 'border-box',
  '&:active': {
    transform: 'scale(.99)',
  },
});

const iconWrapClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  w: '34px',
  h: '34px',
  bdrad: '10px',
  mrb: '6px',
});

const titleClass = rule({
  fz: '14px',
  fw: 600,
  lh: '1.3em',
  mr: 0,
});

const descClass = rule({
  fz: '12px',
  lh: '1.4em',
  mr: 0,
});

export interface ActionCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const ActionCard: React.FC<ActionCardProps> = ({icon, title, description, onClick}) => {
  const theme = useTheme();

  const iconBg = theme.g(0.77, 0.2);
  const iconCol = theme.g(0.18, 0.92);

  const baseBg = theme.g(0.93, 0.11);
  const hoverBg = theme.g(0.88, 0.4);

  const baseBd = theme.g(0.74, 0.32);
  const hoverBd = theme.g(0.66, 0.4);

  const cls = blockClass({
    bg: baseBg,
    bd: `1px solid ${baseBd}`,
    '&:hover': {
      bg: hoverBg,
      bd: `1px solid ${hoverBd}`,
    },
  });

  const paperStyle: React.CSSProperties = {
    borderRadius: 14,
    boxShadow: `0 1px 0 ${theme.g(0, 0.02)}`,
  };

  return (
    <Tilt style={{width: '100%'}} reach={100} scale={1.05}>
      <div
        onClick={onClick as any}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (e.currentTarget as HTMLDivElement).click();
          }
        }}
        role="button"
        tabIndex={0}
        className={cls}
        style={paperStyle}
      >
        <div className={iconWrapClass} style={{background: iconBg, color: iconCol}} aria-hidden>
          {icon}
        </div>
        <h3 className={titleClass} style={{color: theme.g(0.08, 0.96)}}>
          {title}
        </h3>
        {description && (
          <p className={descClass} style={{color: theme.g(0.42, 0.7)}}>
            {description}
          </p>
        )}
      </div>
    </Tilt>
  );
};
