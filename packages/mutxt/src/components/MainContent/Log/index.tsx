import * as React from 'react';
import {useExplorer} from '../../../context';
import {useBehaviorSubject, useBehaviorSubjectOpt} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {JsonCrdtLog} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtLog';
import {DemoDisplay} from '@jsonjoy.com/collaborative-ui/lib/DemoDisplay';
import * as ScrollArea from '@jsonjoy.com/ui/src/4-card/ScrollArea';
import type {Model} from 'json-joy/lib/json-crdt';

export interface LogProps {
  visible?: boolean;
  onModel?: (model: Model<any>, readonly: boolean) => void;
}

export const Log: React.FC<LogProps> = ({ visible, onModel }) => {
  const state = useExplorer();
  const file = useBehaviorSubject(state.file$);
  const logView = useBehaviorSubjectOpt(file?.logState.view$);

  if (!file || !visible) {
    return null;
  }

  return (
    <div style={{margin: '-16px auto 0', padding: (logView === 'tiny' ? 0 : 32) + 'px 8px 0', maxWidth: 1600, width: '100%', maxHeight: 'calc(max(300px,30vh))', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'}}>
      <ScrollArea.ScrollArea shadow style={{width: '100%', maxHeight: 'calc(max(300px,30vh))', height: 'auto'}}>
        <ScrollArea.Viewport style={{width: '100%', height: '100%'}}>
          <JsonCrdtLog
            key={file.id}
            spacious
            state={file.logState}
            log={file.log}
            filename={file.name.value}
            onModel={onModel}
            renderDisplay={
              !file.display
                ? undefined
                : (model, readonly) => <DemoDisplay comp={file.display!} model={model} readonly={readonly} />
            }
          />
        </ScrollArea.Viewport>
        <ScrollArea.ScrollRail style={{width: 8}} />
      </ScrollArea.ScrollArea>
    </div>
  );
};
