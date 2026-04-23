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
  pd: '0',
  minH: 0,
});

export interface DocumentMuTxtProps {
  file: OpenFile;
  peritext: PeritextRef;
  readOnly?: boolean;
  visible?: boolean;
}

const minHeight = 400;

export const DocumentMuTxt: React.FC<DocumentMuTxtProps> = ({ file, peritext, readOnly, visible }) => {
  return (
    <div className={editorShellClass} style={{display: visible ? 'block' : 'none', minHeight}}>
      <MuTxt heightFit hoverElevate peritext={peritext} minHeight={minHeight} readOnly={readOnly} onApi={(api) => {
        file.mutxt = api;
      }} />
    </div>
  );
};
