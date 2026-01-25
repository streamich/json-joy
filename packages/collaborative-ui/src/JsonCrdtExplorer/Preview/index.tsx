import * as React from 'react';
import {useExplorer} from '../context';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {JsonCrdtLog} from '../../JsonCrdtLog';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {FlexibleInput} from 'flexible-input';
import {DemoDisplay} from '../../DemoDisplay';

export type PreviewProps = Record<string, never>;

export const Preview: React.FC<PreviewProps> = () => {
  const state = useExplorer();
  const file = useBehaviorSubject(state.file$);

  if (!file) {
    return null;
  }

  return (
    <JsonCrdtLog
      key={file.id}
      spacious
      state={file.logState}
      log={file.log}
      view={'model'}
      filename={file.name}
      renderDisplay={
        !file.display
          ? undefined
          : (model, readonly) => <DemoDisplay comp={file.display!} model={model} readonly={readonly} />
      }
      renderLeftToolbar={() => (
        <Code gray spacious size={-1}>
          <FlexibleInput value={file.name} onChange={(e) => state.rename(file.id, e.target.value)} />
        </Code>
      )}
    />
  );
};
