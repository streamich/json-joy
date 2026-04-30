import * as React from 'react';
import {rule} from 'nano-theme';
import {MuTxt} from 'mutxt-react';
import type {ObjApi} from 'json-joy/lib/json-crdt';
import type {OpenFile} from '../../state/file';

const editorShellClass = rule({
  d: 'flex',
  fld: 'column',
  flex: '1 1 0%',
  bxz: 'border-box',
  pd: '0',
  minH: 0,
});

const minHeight = 400;

export interface DocumentMuTxtProps {
  file: OpenFile;
  obj: ObjApi;
  readOnly?: boolean;
  visible?: boolean;
}


export const DocumentMuTxt: React.FC<DocumentMuTxtProps> = ({ file, obj, readOnly, visible }) => {
  return (
    <div className={editorShellClass} style={{display: visible ? 'block' : 'none', minHeight}}>
      <MuTxt heightFit hoverElevate obj={obj} minHeight={minHeight} readOnly={readOnly}
        autoFocus
        onApi={(api) => {
          file.mutxt = api;
        }}
        startWithTitle
        onTitleSubmit={title => {
          if (!title) return;
          const now = Date.now();
          const fileLifeTime = now - file.meta.createdAt;
          const isFileOlderThan3Minutes = fileLifeTime > 3 * 60 * 1000;
          if (isFileOlderThan3Minutes) return;
          file.name.next(title);
        }}
      />
    </div>
  );
};
