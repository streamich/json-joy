import * as React from 'react';
import {useExplorer} from '../../../context';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {JsonCrdtLog} from '@jsonjoy.com/collaborative-ui/lib//JsonCrdtLog';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {FlexibleInput} from 'flexible-input';
import {DemoDisplay} from '@jsonjoy.com/collaborative-ui/lib//DemoDisplay';

export type LogProps = Record<string, never>;

export const Log: React.FC<LogProps> = () => {
  const state = useExplorer();
  const file = useBehaviorSubject(state.file$);

  if (!file) {
    return null;
  }

  return (
    <div style={{maxWidth: 1300, minWidth: 500, width: '100%', margin: '0 auto', padding: '32px 16px'}}>
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
        renderLeftToolbar={() => (
          <Code gray spacious size={-1}>
            <FlexibleInput value={file.name.value} onChange={(e) => state.rename(file.id, e.target.value)} />
          </Code>
        )}
      />
    </div>
  );
};
