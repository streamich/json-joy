import * as React from 'react';
import {rule} from 'nano-theme';
import {MuTxt} from 'mutxt-react';
import {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import type {OpenFile} from '../../state/file';

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
  visible?: boolean;
}

export const DocumentMuTxt: React.FC<DocumentMuTxtProps> = ({ file, peritext, visible }) => {
  return (
    <div className={editorShellClass} style={{display: visible ? 'block' : 'none'}}>
      <MuTxt heightFit hoverElevate peritext={peritext} />
    </div>
  );
};
