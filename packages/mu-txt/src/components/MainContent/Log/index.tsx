import * as React from 'react';
import {useT} from 'use-t';
import {useExplorer} from '../../../context';
import {useBehaviorSubject, useBehaviorSubjectOpt} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {JsonCrdtLog} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtLog';
import * as ScrollArea from '@jsonjoy.com/ui/src/4-card/ScrollArea';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
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
  const [hover, setHover] = React.useState(false);

  if (!file || !visible) {
    return null;
  }

  if (!open) {
    const showLog = t('Show log');
    return (
      <div
        style={{
          width: '100%',
          margin: '-12px 0 0',
          padding: '0 0 8px',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          title={showLog}
          aria-label={showLog}
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: '33%',
            height: 20,
            padding: 0,
            margin: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              display: 'block',
              width: '100%',
              height: 4,
              borderRadius: 2,
              background: 'currentColor',
              opacity: hover ? 0.5 : 0.1,
              transition: 'opacity 120ms ease',
            }}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: '-16px 0 0',
        padding: (logView !== 'tiny' ? 32 : 0) + 'px 8px 0',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
      }}
    >
      <div style={{padding: '0 0 8px'}}>
        <BasicTooltip renderTooltip={() => t('Hide log')}>
          <BasicButtonClose rounder size={24} onClick={() => setOpen(false)} />
        </BasicTooltip>
      </div>
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
    </div>
  );
};
