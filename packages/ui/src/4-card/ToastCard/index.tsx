import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {useT} from 'use-t';
import Paper from '../Paper';
import {Code} from '../../1-inline/Code';
import {Progress} from '../../3-list-item/Progress';
import {BasicButtonClose} from '../../2-inline-block/BasicButton/BasicButtonClose';
import {Split} from '../../3-list-item/Split';
import {Flex} from '../../3-list-item/Flex';
import {RunningBackground} from '../../3-list-item/RunningBackground';

const blockClass = rule({
  pos: 'relative',
  d: 'inline-block',
  maxW: '480px',
  w: 'auto',
  ov: 'hidden',
  animation: 'fadeInScaleOut .3s',
});

const mainClass = rule({
  pos: 'relative',
  d: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  bxz: 'border-box',
  // pad: '24px',
  pad: '16px',
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
    // fill: theme.blue,
    fill: theme.g(0.6),
    col: theme.blue,
  },
  '&:hover svg': {
    col: theme.color.sem.negative[0],
  },
});

const headerClass = rule({
  // marl: '-2px',
  // pad: '0 0 16px',
});

const contentClass = rule({
  ...theme.font.ui2.mid,
  fz: '13px',
  pad: '12px 0 0',
  lh: '1.6em',
  col: theme.g(0.45),
  '@media only screen and (max-width: 800px)': {
    fz: '14px',
  },
});

const titleClass = rule({
  ...theme.font.ui1.mid,
  fz: '15px',
  col: theme.g(0.25),
});

export interface ToastCardProps {
  type?: string;
  title?: React.ReactNode;
  message?: React.ReactNode;
  progress?: number;
  glow?: boolean;
  onClose?: () => void;
}

export const ToastCard: React.FC<ToastCardProps> = ({
  type = 'info',
  title,
  message,
  progress,
  glow = true,
  onClose,
}) => {
  const [t] = useT();

  const header = (
    <Split style={{alignItems: 'center'}}>
      <Flex style={{alignItems: 'center'}}>
        {!!type && (
          <span style={{fontSize: '0.8em', opacity: 0.7, userSelect: 'none', marginRight: 12}}>
            <Code gray spacious alt>
              {t(type)}
            </Code>
          </span>
        )}
        <span className={titleClass}>{title}</span>
      </Flex>
      <div style={{margin: '-7px -7px -11px 16px'}}>
        {!!onClose && <BasicButtonClose size={32} onClick={() => onClose()} />}
      </div>
    </Split>
  );

  const style: React.CSSProperties = {};

  return (
    <Paper fill={0} contrast className={blockClass}>
      {typeof progress === 'number' && (
        <div style={{position: 'relative', marginBottom: '-2px'}}>
          <RunningBackground />
          <div style={{position: 'absolute', top: 0, left: 0, right: 0}}>
            <Progress glow={glow} value={progress} />
          </div>
        </div>
      )}
      <div className={mainClass} style={style}>
        <div>
          <div className={headerClass}>{header}</div>
          {!!message && <div className={contentClass}>{message}</div>}
        </div>
      </div>
    </Paper>
  );
};
