import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {ZINDEX} from '../../constants';

const paneClass = rule({
  d: 'inline-block',
  pos: 'relative',
  z: ZINDEX.CONTEXT,
  lh: '1.2em',
  l: 'auto',
  r: 0,
  bdrad: '8px',
  trs: 'transform .45s cubic-bezier(.2,2,0,1), opacity .3s',
  bdt: '1px solid rgba(0,0,0,.1)',
  bdl: '1px solid rgba(0,0,0,.2)',
  bdr: '1px solid rgba(0,0,0,.15)',
  bdb: '1px solid rgba(0,0,0,.25)',
  '&:hover': {
    bdt: '1px solid rgba(0,0,0,.2)',
    bdl: '1px solid rgba(0,0,0,.3)',
    bdr: '1px solid rgba(0,0,0,.25)',
    bdb: '1px solid rgba(0,0,0,.35)',
  },
});

const bodyClass = rule({
  pos: 'relative',
  zIndex: 2,
  bdrad: '4px',
});

const triangleClass = rule({
  pos: 'absolute',
  zIndex: 1,
  w: '7px',
  h: '7px',
  t: '2px',
  transform: 'rotate(45deg) translate(-5px,-5px)',
  bdl: '1px solid rgba(0,0,0,.15)',
  bdt: '1px solid rgba(0,0,0,.15)',
  bdr: '1px solid #fff',
  bdb: '1px solid #fff',
  bg: '#fff',
  borderTopLeftRadius: '2px',
  bxsh: '0 -1px 1px rgba(0,0,0,.035)',
});

export interface ContextPaneProps {
  right?: boolean;

  // Whether to not close the drop down on click event.
  dontClose?: boolean;
  triangle?: boolean;
  hide?: boolean;

  canOverflow?: boolean;

  minWidth?: number;

  onClick?: React.MouseEventHandler;

  style?: React.CSSProperties;
  accent?: string;
  className?: string;
  children?: React.ReactNode;
}

export type IContextPaneState = {};

export const ContextPane: React.FC<ContextPaneProps> = ({
  children,
  right,
  triangle,
  canOverflow,
  minWidth,
  hide,
  style,
  accent,
  className,
  onClick,
}) => {
  const theme = useTheme();

  const blockStyle: React.CSSProperties = {
    ...(style || {}),
    background: theme.isLight ? theme.bg : theme.g(0.98),
    boxShadow: theme.isLight
      ? '0 4px 8px -2px rgba(9,30,66,.25),0 0 13px rgba(9,30,66,.13),0 0 1px rgba(9,30,66,.2)'
      : `0 0 0 1px ${theme.g(0.1, 0.16)}`,
  };

  if (minWidth) {
    blockStyle.minWidth = minWidth;
  }

  if (!right) {
    blockStyle.left = 0;
    blockStyle.right = 'auto';
  }

  if (hide !== undefined) {
    blockStyle.transform = hide ? 'scale(.85)' : 'scale(1)';
    blockStyle.opacity = hide ? 0 : 1;
  }

  if (accent) {
    blockStyle.borderBottom = `2px solid ${accent}`;
    // blockStyle.borderTop = `2px solid ${accent}`;
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: programmatic click handler
    <div className={paneClass + (className || '')} style={blockStyle} onClick={onClick}>
      <div className={bodyClass} style={{overflow: canOverflow ? 'visible' : undefined}}>
        {children}
      </div>
      {triangle && (
        <div
          className={triangleClass}
          style={{
            left: right ? 'auto' : 15,
            right: right ? 15 : 'auto',
          }}
        />
      )}
    </div>
  );
};
