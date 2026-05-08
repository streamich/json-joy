import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';

const blockClass = drule({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '6px',
  padding: '20px 20px 18px',
  cursor: 'pointer',
  textAlign: 'left',
  userSelect: 'none',
  transition: 'transform .15s ease, background .15s ease, border-color .15s ease',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
  minHeight: '128px',
  boxSizing: 'border-box',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'scale(.99)',
  },
});

const iconWrapClass = rule({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  marginBottom: '6px',
});

const titleClass = rule({
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '1.3em',
  margin: 0,
});

const descClass = rule({
  fontSize: '12px',
  lineHeight: '1.4em',
  margin: 0,
});

export interface ActionCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const ActionCard: React.FC<ActionCardProps> = ({icon, title, description, onClick}) => {
  const theme = useTheme();

  const iconBg = theme.g(0.85, 0.24);
  const iconCol = theme.g(0.18, 0.92);

  const baseBg = theme.g(0.93, 0.11);
  const hoverBg = theme.g(0.89, 0.16);
  const baseBd = theme.g(0.74, 0.32);
  const hoverBd = theme.g(0.62, 0.42);

  const cls = blockClass({
    background: baseBg,
    '&:hover': {
      background: hoverBg,
      borderColor: hoverBd,
    },
  });

  const paperStyle: React.CSSProperties = {
    borderRadius: 14,
    border: `1px solid ${baseBd}`,
    boxShadow: `0 1px 0 ${theme.g(0, 0.02)}`,
  };

  return (
    <Paper
      noOutline
      hoverElevate
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
    </Paper>
  );
};
