import * as React from 'react';
import {Log} from './Log';
import {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import {ext, PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import {DocumentMuTxt} from './DocumentMuTxt';
import type {OpenFile} from '../../state/file';

export interface DocumentProps {
  file: OpenFile;
}

export const Document: React.FC<DocumentProps> = ({ file }) => {
  const peritext: PeritextRef | undefined = React.useMemo(() => {
    if (file.log.end.api.read('/@type') !== 'mutxt') return;
    const api = file.log.end.api.in(['text']).asExt(ext.peritext) as PeritextApi;
    return () => api;
  }, [file]);

  if (peritext) {
    return <DocumentMuTxt file={file} peritext={peritext} />;
  }

  return <Log />;
};
