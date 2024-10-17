import * as React from 'react';
import {rule} from 'nano-theme';
import {Char} from '../../constants';
import {AnchorViewProps} from '../../react/selection/AnchorView';

const color = '#07f';

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
  bg: color,
});

export interface RenderAnchorProps extends AnchorViewProps {}

export const RenderAnchor: React.FC<RenderAnchorProps> = () => {
  return (
    <span className={blockClass}>
      <span className={innerClass}>
        {Char.ZeroLengthSpace}
      </span>
    </span>
  );
};
