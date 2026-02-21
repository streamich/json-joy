import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {RunningBackground} from '@jsonjoy.com/ui/lib/3-list-item/RunningBackground';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useToasts} from '@jsonjoy.com/ui/lib/7-fullscreen/ToastCardManager/context';
import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {LogicalTimestamp} from '../LogicalTimestamp';
import {JsonCrdtLogState, type JsonCrdtLogView} from './JsonCrdtLogState';
import type {Log} from 'json-joy/lib/json-crdt/log/Log';
import {ViewSelect} from './ViewSelect';
import {JsonCrdtModel, type JsonCrdtModelProps} from '../JsonCrdtModel';
import {Timeline} from './Timeline';
import {context} from './context';
import {PlaybackToolbar} from './PlaybackToolbar';
import {JsonCrdtLogTextual} from './JsonCrdtLogTextual';
import {JsonCrdtLogPinnedPatch} from './JsonCrdtLogPinnedPatch';
import {PlayIcon} from '../icons/PlayIcon';
import type {ITimestampStruct, Model} from 'json-joy/lib/json-crdt';
import {DownloadButton} from './DownloadButton';
import useWindowSize from 'react-use/lib/useWindowSize';

const css = {
  header: rule({
    pad: '8px 8px 8px 16px',
  }),
  content: rule({
    pad: '0 8px 8px',
  }),
};

export interface JsonCrdtLogProps extends Pick<JsonCrdtModelProps, 'renderDisplay'> {
  state?: JsonCrdtLogState;
  log: Log<any>;
  view?: JsonCrdtLogView;
  spacious?: boolean;
  /** Name used when downloading the log as file. */
  filename?: string;
  renderLeftToolbar?: () => React.ReactNode;
  onModel?: (model: Model<any>, readonly: boolean) => void;
}

export const JsonCrdtLog: React.FC<JsonCrdtLogProps> = ({
  log,
  state: _state,
  view: _view,
  spacious,
  filename,
  renderDisplay,
  renderLeftToolbar,
  onModel,
}) => {
  const {width} = useWindowSize();
  const [t] = useT();
  const toasts = useToasts();
  // biome-ignore lint: manual dependency list
  const state = React.useMemo(() => (_state ? _state : new JsonCrdtLogState(log, {view: _view})), [_state, log]);
  const view = useBehaviorSubject(state.view$);
  let firstId: ITimestampStruct = log.start().clock;
  if (firstId.time === 1) {
    const firstPatchId = log.patches.first()?.v.getId();
    if (firstPatchId) firstId = firstPatchId;
  }
  const pinnedModel = useBehaviorSubject(state.pinnedModel$);
  const model = pinnedModel ?? log.end;
  const readonlyEnforcementCounter = useBehaviorSubject(state.readonlyEnforced$);
  // biome-ignore lint: manual dependency list
  React.useEffect(() => {
    if (onModel) {
      onModel(model, !!pinnedModel);
    }
  }, [model]);

  // biome-ignore lint: manual dependency list
  React.useEffect(() => {
    if (readonlyEnforcementCounter) {
      toasts.bottomRight.add({
        id: 'readonly',
        duration: 2000,
        type: 'readonly',
        title: 'Model state is pinned',
        message: (
          <div style={{minWidth: '330px'}}>
            Press play button "<PlayIcon width={12} height={12} />" to resume editing.
          </div>
        ),
      });
    }
  }, [readonlyEnforcementCounter]);

  const header = (
    <Split style={{alignItems: 'center'}}>
      <Flex style={{alignItems: 'center'}}>
        <div style={{marginTop: -1}}>
          <MiniTitle>{t('Log')}</MiniTitle>
        </div>
        {!!renderLeftToolbar && (
          <>
            <Space horizontal size={1} />
            {renderLeftToolbar()}
          </>
        )}
        <Space horizontal size={1} />
        {!!firstId && width > 500 && (
          <>
            <LogicalTimestamp sid={firstId.sid ?? 0} time={firstId.time ?? 0} />
            &nbsp;{'–'}&nbsp;
          </>
        )}
        <LogicalTimestamp sid={log.end.clock.sid ?? 0} time={log.end.clock.time ? log.end.clock.time - 1 : 0} />
      </Flex>
      <div>
        <Flex style={{alignItems: 'center'}}>
          <DownloadButton filename={filename} />
          <Space horizontal size={-1} />
          <ViewSelect state={state} />
          <Space horizontal size={1} />
          <PlaybackToolbar state={state} />
        </Flex>
      </div>
    </Split>
  );

  let content: React.ReactNode = null;

  switch (view) {
    case 'timeline':
      content = <JsonCrdtLogPinnedPatch filename={filename} />;
      break;
    case 'model':
      content = (
        <>
          <JsonCrdtLogPinnedPatch filename={filename} />
          {!!pinnedModel && <Space size={-1} />}
          <JsonCrdtModel
            state={state.modelState}
            model={model}
            filename={filename}
            readonly={!!pinnedModel}
            renderDisplay={renderDisplay}
          />
        </>
      );
      break;
    case 'text':
      content = <JsonCrdtLogTextual log={log} />;
      break;
  }

  return (
    <context.Provider value={state}>
      <Paper contrast round={!!spacious} style={{minWidth: 400, padding: spacious ? '0 8px 8px 8px' : undefined}}>
        {!!pinnedModel && <RunningBackground />}
        <div className={css.header} style={{marginTop: spacious ? (pinnedModel ? 6 : 8) : 0}}>
          {header}
        </div>
        {(view === 'timeline' || view === 'model') && <Timeline log={log} />}
        <div className={css.content}>{content}</div>
      </Paper>
    </context.Provider>
  );
};
