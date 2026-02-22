import * as React from 'react';
import {theme, rule} from 'nano-theme';
import Svg from 'iconista';
import {Link} from 'react-router-lite';
import {useT} from 'use-t';
import {Code} from '../../1-inline/Code';
import {Paper} from '../Paper';

const blockClass = rule({
  pos: 'relative',
  d: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  h: '240px',
  bxz: 'border-box',
  pad: '32px',
  mar: '18px',
  h2: {
    ...theme.font.ui2.bold,
    fz: '24px',
    mar: 0,
    pad: 0,
  },
  p: {
    pad: 0,
    mar: 0,
  },
  svg: {
    fill: theme.g(0.6),
    col: theme.blue(1),
  },
  '&:hover svg': {
    col: theme.color.sem.negative[0],
  },
});

const headerClass = rule({
  marl: '-2px',
  pad: '0 0 16px',
});

const contentClass = rule({
  ...theme.font.ui3,
  fz: '14px',
  pad: '24px 0 0',
  lh: '1.6em',
  col: theme.g(0.45),
  '@media only screen and (max-width: 800px)': {
    pad: '16px 0',
    fz: '14px',
  },
});

const linkClass = rule({
  a: {
    d: 'flex',
    alignItems: 'center',
    svg: {
      marl: '8px',
      fill: theme.blue,
      trs: 'transform .2s',
    },
    '&:hover': {
      svg: {
        fill: 'red',
        transform: 'translate(10px,0)',
      },
    },
    '&::before': {
      pos: 'absolute',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
      z: 1,
      pointerEvents: 'auto',
      content: '""',
      bg: 'transparent !important',
    },
  },
});

const stageClass = rule({
  ...theme.font.ui3,
  fz: '14px',
  col: theme.g(0.6),
  marl: '16px',
});

export interface ClickCardProps {
  title: React.ReactNode;
  to: string;
  toTitle?: string;
  tall?: boolean;
  children?: React.ReactNode | undefined;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  header?: React.ReactNode;
  noRotate?: boolean;
  onClick?: React.MouseEventHandler;
}

export const ClickCard: React.FC<ClickCardProps> = ({
  to,
  toTitle,
  title,
  icon,
  label,
  header,
  tall,
  noRotate,
  children,
  onClick,
}) => {
  const [t] = useT();

  const labelElement =
    !!icon || !!label || !!header ? (
      <span style={{height: 24, display: 'flex', alignItems: 'center'}}>
        {icon}
        {!!label && (
          <span style={{fontSize: '0.9em', opacity: 0.7, marginLeft: 16}}>
            <Code gray spacious alt>
              {t('library')}d
            </Code>
          </span>
        )}
        {!!header && <span className={stageClass}>{header}</span>}
      </span>
    ) : null;

  const style: React.CSSProperties = {};

  if (tall) {
    style.height = 300;
  }

  let element = (
    <Paper contrast hoverElevate round className={blockClass} style={style}>
      <div>
        {!!labelElement && <div className={headerClass}>{labelElement}</div>}
        <h2>{title}</h2>
        <div className={contentClass}>{children}</div>
      </div>
      <div className={linkClass}>
        <Link
          a
          to={to}
          onClick={
            onClick
              ? (e) => {
                  e.preventDefault();
                  onClick(e);
                }
              : undefined
          }
        >
          {toTitle || t('View')}
          <Svg set="ibm_16" icon="arrow--right" width={16} height={16} />
        </Link>
      </div>
    </Paper>
  );

  if (!noRotate) {
    element = <div className={'hoverRotate'}>{element}</div>;
  }

  return element;
};
