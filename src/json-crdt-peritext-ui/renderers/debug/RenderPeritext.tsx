import * as React from 'react';
import {rule} from 'nano-theme';
import type {PeritextViewProps} from '../../react';

const childrenClass = rule({
  out: '1px dotted black !important',
  'caret-color': 'black !important',
  '::selection': {
    bgc: 'red !important',
  },
});

const dumpClass = rule({
  bg: '#fafafa',
  fz: '8px',
  pad: '8px 16px',
  bxz: 'border-box',
});

export interface RenderPeritextProps extends PeritextViewProps {
  children?: React.ReactNode;
}

export const RenderPeritext: React.FC<RenderPeritextProps> = ({peritext, children}) => {
  return (
    <>
      <div className={childrenClass}>
        {children}
      </div>
      <div className={dumpClass}>
        <pre>{peritext + ''}</pre>
      </div>
    </>
  );
};
