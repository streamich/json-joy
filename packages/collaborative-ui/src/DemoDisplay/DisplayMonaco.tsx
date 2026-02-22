import * as React from 'react';
import {CollaborativeMonaco} from 'collaborative-monaco/lib/CollaborativeMonaco';
import type {DemoProps} from './types';

export interface DisplayMonacoProps extends DemoProps {}

const DisplayMonaco: React.FC<DisplayMonacoProps> = ({model, path = []}) => {
  try {
    const str = model.api.str(path);
    return (
      <div style={{boxSizing: 'border-box', padding: 16, width: '100%', height: '100%'}}>
        {!str ? null : <CollaborativeMonaco height={'200px'} str={() => str} />}
      </div>
    );
  } catch {
    return null;
  }
};

export default DisplayMonaco;
