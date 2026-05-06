import * as React from 'react';
import {rule} from 'nano-theme';
import type {OpenFile} from '../../state/file';
import {JsonCrdtLog} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtLog';

const editorShellClass = rule({
  d: 'flex',
  fld: 'column',
  flex: '1 1 0%',
  bxz: 'border-box',
  pd: '0',
  minH: 0,
});

export interface DocumentJsonProps {
  file: OpenFile;
  readOnly?: boolean;
  visible?: boolean;
}

export const DocumentJson: React.FC<DocumentJsonProps> = ({file, visible}) => {
  React.useEffect(() => {
    file.logState.view$.next('model');
    // file.logState.modelState.
  }, [file]);

  return (
    <div
      className={editorShellClass}
      style={{
        display: visible ? 'block' : 'none',
        height: '100%',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        boxSizing: 'border-box',
        padding: 16,
      }}
    >
      <JsonCrdtLog
        key={file.id}
        spacious
        state={file.logState}
        log={file.log}
        filename={file.name.value}
        onModel={(model) => file.activeModel.next(model)}
      />
    </div>
  );
};
