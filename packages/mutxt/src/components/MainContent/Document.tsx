import * as React from 'react';
import {Log} from './Log';
import {PeritextRef} from '@jsonjoy.com/collaborative-peritext';
import {ext, PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import {DocumentMuTxt} from './DocumentMuTxt';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import type {OpenFile} from '../../state/file';
import type {Model} from 'json-joy/lib/json-crdt';

export interface DocumentProps {
  file: OpenFile;
}

export const Document: React.FC<DocumentProps> = ({ file }) => {
  const [activeModel, setActiveModel] = React.useState<Model<any>>(() => file.log.end);
  const [readonly, setReadonly] = React.useState(false);
  React.useEffect(() => {
    const pinnedModel = file.logState.pinnedModel$.getValue();
    setActiveModel(pinnedModel ?? file.log.end);
    setReadonly(!!pinnedModel);
  }, [file]);
  const peritext: PeritextRef | undefined = React.useMemo(() => {
    if (activeModel.api.read('/@type') !== 'mutxt') return;
    const api = activeModel.api.in(['text']).asExt(ext.peritext) as PeritextApi;
    return () => api;
  }, [activeModel]);
  const state = useExplorer();
  const selected = useBehaviorSubject(state.file$);
  const handleModel = React.useCallback((model: Model<any>, readonly: boolean) => {
    setActiveModel(model);
    setReadonly(readonly);
  }, []);


  if (peritext) {
    return (
      <>
        <DocumentMuTxt file={file} peritext={peritext} readOnly={readonly} visible={selected === file} />
        <Log visible={selected === file} onModel={handleModel} />
      </>
    );
  }

  return <Log visible={selected === file} onModel={handleModel} />;
};
