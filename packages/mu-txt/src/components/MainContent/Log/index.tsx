import * as React from 'react';
import {useT} from 'use-t';
import {useExplorer} from '../../../context';
import {useBehaviorSubject, useBehaviorSubjectOpt} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {JsonCrdtLog} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtLog';
import * as ScrollArea from '@jsonjoy.com/ui/src/4-card/ScrollArea';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {Model} from 'json-joy/lib/json-crdt';

export interface LogProps {
  visible?: boolean;
  onModel?: (model: Model<any>, readonly: boolean) => void;
}

export const Log: React.FC<LogProps> = ({visible, onModel}) => {
  const [t] = useT();
  const state = useExplorer();
  const file = useBehaviorSubject(state.file$);
  const logView = useBehaviorSubjectOpt(file?.logState.view$);
  const [open, setOpen] = React.useState(false);

  if (!file || !visible) {
    return null;
  }

  const toggle = (
    <div style={{padding: open ? '0 0 8px' : '4px 0'}}>
      <BasicTooltip renderTooltip={() => (open ? t('Hide log') : t('Show log'))}>
        <BasicButton rounder size={24} onClick={() => setOpen((v) => !v)}>
          <Iconista set="ant_outline" icon="reload-time" width={16} height={16} />
        </BasicButton>
      </BasicTooltip>
    </div>
  );

  return (
    <div
      style={{
        margin: '-16px 0 0',
        padding: (open && logView !== 'tiny' ? 32 : 0) + 'px 8px 0',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      {toggle}
      {open && (
        <div
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            maxWidth: 1600,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(max(300px,30vh))',
          }}
        >
          <ScrollArea.ScrollArea shadow style={{width: '100%', maxHeight: 'calc(max(300px,30vh))', height: 'auto'}}>
            <ScrollArea.Viewport style={{width: '100%', height: '100%'}}>
              <JsonCrdtLog
                key={file.id}
                spacious
                state={file.logState}
                log={file.log}
                filename={file.name.value}
                onModel={onModel}
              />
            </ScrollArea.Viewport>
            <ScrollArea.ScrollRail style={{width: 8}} />
          </ScrollArea.ScrollArea>
        </div>
      )}
    </div>
  );
};
