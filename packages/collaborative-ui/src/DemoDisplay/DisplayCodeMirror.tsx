import * as React from 'react';
import type {DemoProps} from './types';
import {CodeMirrorEditor} from './CodeMirrorEditor';

export interface DisplayCodeMirrorProps extends DemoProps {}

const DisplayCodeMirror: React.FC<DisplayCodeMirrorProps> = ({model, path = []}) => {
  try {
    const str = model.api.str(path);
    return (
      <div
        style={{
          boxSizing: 'border-box',
          padding: 2,
          borderRadius: 4,
          overflow: 'hidden',
          width: '100%',
          height: '100%',
        }}
      >
        {!str ? null : <CodeMirrorEditor style={{height: 300}} str={() => str} />}
      </div>
    );
  } catch {
    return null;
  }
};

export default DisplayCodeMirror;
