import * as React from 'react';
import {RendererMap} from "../../react/types";

export const renderers: RendererMap = {
  inline: (props, children, attributes) => {
    const style = attributes.style || (attributes.style = {});
    style.outline = '1px dotted red';
    return children;
  },
  block: ({hash}, children) => {
    return (
      <div>
        <div contentEditable={false} style={{margin: '16px 0 8px'}}>
          <span style={{fontSize: '0.7em', background: 'rgba(0,0,0,.1)', display: 'inline-block'}}>#{hash}</span>
        </div>
        <div style={{outline: '1px dotted blue'}}>
          {children}
        </div>
      </div>
    );
  },
};
