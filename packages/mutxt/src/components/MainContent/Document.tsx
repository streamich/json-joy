import * as React from 'react';
import {Log} from './Log';
import {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import {ext, PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import {DocumentMuTxt} from './DocumentMuTxt';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import Paper from '@jsonjoy.com/ui/lib/4-card/Paper';
import {JsonCrdtModel} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtModel';
import {SetNamedTrace} from '@jsonjoy.com/ui';
import type {OpenFile} from '../../state/file';

export interface DocumentProps {
  file: OpenFile;
}

export const Document: React.FC<DocumentProps> = ({ file }) => {
  const activeModel = file.activeModel.use();
  const peritext: PeritextRef | undefined = React.useMemo(() => {
    if (activeModel.api.read('/@type') !== 'mutxt') return;
    const api = activeModel.api.in(['text']).asExt(ext.peritext) as PeritextApi;
    return () => api;
  }, [activeModel]);
  const state = useExplorer();
  const selected = useBehaviorSubject(state.file$);

  const readonly = activeModel !== file.log.end;
  const visible = selected === file;

  if (peritext) {
    return (
      <SetNamedTrace name={'hidden'} value={!visible}>
        <DocumentMuTxt
          file={file}
          peritext={peritext}
          readOnly={readonly}
          visible={visible}
        />
        <Log visible={visible} onModel={(model) => file.activeModel.next(model)} />
      </SetNamedTrace>
    );
  }

  return (
    <SetNamedTrace name={'hidden'} value={!visible}>
      <div style={{display: visible ? 'block' : 'none'}}>
        <Paper>
          <JsonCrdtModel model={activeModel} />
        </Paper>
        <Log visible={visible} onModel={(model) => file.activeModel.next(model)} />
      </div>
    </SetNamedTrace>
  );
};
