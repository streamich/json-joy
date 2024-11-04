// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {Char} from '../../constants';
import {DefaultRendererColors} from './constants';
import {usePeritext} from '../../react';
import {useSyncStore} from '../../react/hooks';
import type {AnchorViewProps} from '../../react/selection/AnchorView';

const blockClass = rule({
  pos: 'relative',
  d: 'inline-block',
  pe: 'none',
  us: 'none',
  w: '0px',
  h: '100%',
  bg: 'black',
  va: 'top',
});

const innerClass = rule({
  pos: 'absolute',
  left: 'calc(max(-8px,-0.25em))',
  top: '.85em',
  w: 'calc(min(16px,0.5em))',
  h: 'calc(min(16px,0.5em))',
  bdrad: '50%/30%',
  bg: DefaultRendererColors.ActiveCursor,
});

export interface RenderAnchorProps extends AnchorViewProps {}

export const RenderAnchor: React.FC<RenderAnchorProps> = () => {
  const {dom} = usePeritext();
  const focus = useSyncStore(dom.cursor.focus);

  const style = focus ? undefined : {background: DefaultRendererColors.InactiveCursor};

  return (
    <span className={blockClass}>
      <span className={innerClass} style={style}>{Char.ZeroLengthSpace}</span>
    </span>
  );
};
