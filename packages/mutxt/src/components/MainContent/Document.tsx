import * as React from 'react';
import {rule} from 'nano-theme';
import {Log} from './Log';
import {MuTxt} from 'mutxt-react';
import type {OpenFile} from '../../state/file';

const editorShellClass = rule({
  d: 'flex',
  fld: 'column',
  flex: '1 1 0%',
  bxz: 'border-box',
  pd: '0 0 16px',
  minH: 0,
});

export interface DocumentProps {
  file: OpenFile;
}

export const Document: React.FC<DocumentProps> = ({ file }) => {
  if (file.log.end.api.read('/@type') === 'mutxt') {
    return (
      <div className={editorShellClass}>
            <MuTxt heightFit hoverElevate />
          </div>
    );
  }

  return <Log />;
};
