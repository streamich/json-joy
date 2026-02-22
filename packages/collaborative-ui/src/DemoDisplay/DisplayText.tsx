import * as React from 'react';
import {CollaborativeTextarea} from '../CollaborativeTextarea';
import {rule, theme} from 'nano-theme';
import type {DemoProps} from './types';

const blockClass = rule({
  ...theme.font.mono.bold,
  fz: '18px',
  bxz: 'border-box',
  bg: 'rgba(244,211,44,.2)',
  w: '100%',
  h: '100%',
  minH: '200px',
  bdrad: '8px',
  pd: '16px',
  mr: 0,
  bd: '1px solid transparent',
  out: 0,
  resize: 'none',
  mask: 'conic-gradient(from calc(90deg/-2) at bottom,#000 90deg,#0000 0) 50%/16px',
});

export interface DisplayTextProps extends DemoProps {}

const DisplayText: React.FC<DisplayTextProps> = ({model, path = []}) => {
  try {
    const str = model.api.str(path);
    return (
      <div style={{boxSizing: 'border-box', padding: 16, width: '100%', height: '100%'}}>
        <CollaborativeTextarea className={blockClass} str={() => str} />
      </div>
    );
  } catch {
    return null;
  }
};

export default DisplayText;
