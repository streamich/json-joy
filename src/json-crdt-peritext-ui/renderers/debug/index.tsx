import * as React from 'react';
import {rule} from 'nano-theme';
import {RendererMap} from "../../react/types";

const peritextClass = rule({
  out: '1px dotted black !important',
  'caret-color': 'black !important',
  '::selection': {
    bgc: 'red !important',
  },
});

export const renderers: RendererMap = {
  inline: (props, children, attributes) => {
    const style = attributes.style || (attributes.style = {});
    style.outline = '1px dotted red';
    return children;
  },
  block: ({hash, block}, children) => {
    const isRoot = block.tag() === '';
    if (isRoot) return children;
    return (
      <div style={{position: 'relative'}}>
        <div contentEditable={false} style={{position: 'absolute', top: '-24px', left: 0}}>
          <span style={{fontSize: '9px', padding: '2px 4px', borderRadius: 3, background: 'rgba(0,0,0)', color: 'white', display: 'inline-block'}}>#{hash}</span>
        </div>
        <div style={{outline: '1px dotted blue'}}>
          {children}
        </div>
      </div>
    );
  },
  peritext: (props, children) => {
    return (
      <div className={peritextClass}>
        {children}
      </div>
    );
  },
};
