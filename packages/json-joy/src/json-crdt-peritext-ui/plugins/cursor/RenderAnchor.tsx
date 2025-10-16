import * as React from 'react';
import {rule, keyframes} from 'nano-theme';
import {DefaultRendererColors} from './constants';
import {usePeritext} from '../../web/react';
import {useSyncStoreOpt} from '../../web/react/hooks';
import type {AnchorViewProps} from '../../web/react/cursor/AnchorView';

export const fadeInAnimation = keyframes({
  from: {
    tr: 'scale(0)',
  },
  to: {
    tr: 'scale(1)',
  },
});

const blockClass = rule({
  pos: 'relative',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  va: 'center',
});

const innerClass = rule({
  pos: 'absolute',
  l: 'calc(max(-6px,-0.2em))',
  b: '-.15em',
  w: 'calc(min(12px,0.4em))',
  h: 'calc(min(16px,0.5em))',
  bdrad: '50%/20%',
  bg: DefaultRendererColors.ActiveCursor,
  an: fadeInAnimation + ' .25s ease-out',
  animationFillMode: 'forwards',
});

export interface RenderAnchorProps extends AnchorViewProps {
  children: React.ReactNode;
}

export const RenderAnchor: React.FC<RenderAnchorProps> = ({children}) => {
  const {dom} = usePeritext();
  const focus = useSyncStoreOpt(dom?.cursor.focus) || false;

  const style = focus ? undefined : {background: DefaultRendererColors.InactiveCursor};

  return (
    <span className={blockClass} contentEditable={false}>
      {children}
      <span className={innerClass} style={style} />
    </span>
  );
};
