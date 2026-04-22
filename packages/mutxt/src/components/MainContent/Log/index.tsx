import * as React from 'react';
import {useExplorer} from '../../../context';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {JsonCrdtLog} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtLog';
import {DemoDisplay} from '@jsonjoy.com/collaborative-ui/lib/DemoDisplay';

export interface LogProps {
  visible?: boolean;
}

export const Log: React.FC<LogProps> = ({ visible }) => {
  const state = useExplorer();
  const file = useBehaviorSubject(state.file$);

  if (!file || !visible) {
    return null;
  }

  return (
    <div style={{maxWidth: 1300, minWidth: 500, width: '100%', margin: '0 auto', padding: '16px 16px 32px'}}>
      <JsonCrdtLog
        key={file.id}
        spacious
        state={file.logState}
        log={file.log}
        view={'model'}
        filename={file.name.value}
        renderDisplay={
          !file.display
            ? undefined
            : (model, readonly) => <DemoDisplay comp={file.display!} model={model} readonly={readonly} />
        }
      />
    </div>
  );
};
