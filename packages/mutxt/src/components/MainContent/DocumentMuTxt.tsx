import * as React from 'react';
import {rule} from 'nano-theme';
import {MuTxt} from 'mutxt-react';
import type {OpenFile} from '../../state/file';
import {PeritextRef} from '@jsonjoy.com/collaborative-peritext';

const editorShellClass = rule({
  d: 'flex',
  fld: 'column',
  flex: '1 1 0%',
  bxz: 'border-box',
  pd: '0 0 16px',
  minH: 0,
});

export interface DocumentMuTxtProps {
  file: OpenFile;
  peritext: PeritextRef;
}

export const DocumentMuTxt: React.FC<DocumentMuTxtProps> = ({ file, peritext }) => {
  return (
    <div className={editorShellClass}>
      <MuTxt heightFit hoverElevate peritext={peritext} />
    </div>
  );
};
