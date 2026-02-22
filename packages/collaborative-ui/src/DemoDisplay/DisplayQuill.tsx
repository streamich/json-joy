import * as React from 'react';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill-react';
import {ext} from 'json-joy/lib/json-crdt-extensions';
import type {DemoProps} from './types';

export interface DisplayQuillProps extends DemoProps {}

const DisplayQuill: React.FC<DisplayQuillProps> = ({model, path = [], readonly}) => {
  try {
    model.api.in(path).asExt(ext.quill);
  } catch {
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <CollaborativeQuill
        readonly={readonly}
        api={() => {
          try {
            return model.api.in(path).asExt(ext.quill);
          } catch {
            return undefined;
          }
        }}
        style={{
          width: '100%',
          height: '300px',
        }}
      />
    </div>
  );
};

export default DisplayQuill;
