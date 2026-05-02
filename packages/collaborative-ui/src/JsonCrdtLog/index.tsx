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
import {DownloadButton} from './DownloadButton';
import useWindowSize from 'react-use/lib/useWindowSize';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Progress} from '@jsonjoy.com/ui/lib/3-list-item/Progress';
import type {ITimestampStruct, Model} from 'json-joy/lib/json-crdt';

const blockClass = rule({});

const contentClass = rule({
  pd: '0 8px 8px',
});

const headerClass = rule({
  pos: 'relative',
  z: 2,
  pd: '8px 8px 8px 16px',
});

const pinnedHeaderClass = rule({
  op: 1,
});

const tinyBlockClass = rule({
  '& .jj-log-timeline': {
    filter: 'grayscale(1)',
    op: 0.5,
  },
  '&:hover .jj-log-timeline': {
    filter: 'grayscale(0)',
    op: 1,
  },
});

const tinyHeaderClass = rule({
  op: 0,
  pd: '0 8px',
  [`.${blockClass.trim()}:hover &`]: {
    op: 1,
  },
  '&:has(+ .jj-log-timeline:hover)': {
    op: 0,
    pe: 'none',
  },
  [`.${pinnedHeaderClass.trim()}&`]: {
    op: 1,
  },
  [`&+.${pinnedHeaderClass.trim()}:has(+ .jj-log-timeline:hover)`]: {
    op: 0,
    pe: 'none',
  },
});

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
  const styles = useStyles();
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
  const pinnedIdx = useBehaviorSubject(state.pinnedPatchIdx$);
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

  const tiny = view === 'tiny';

  const toolbar = (
    <Flex style={{alignItems: 'center'}}>
      <DownloadButton filename={filename} />
      <Space horizontal size={-1} />
      <ViewSelect state={state} />
      <Space horizontal size={1} />
      <PlaybackToolbar state={state} />
    </Flex>
  );

  const header = (
    <Split style={{alignItems: 'center'}}>
      <Flex style={{alignItems: 'center'}}>
        <div style={{marginTop: -1, display: tiny ? 'none' : void 0}}>
          <MiniTitle>{t('Log')}</MiniTitle>
        </div>
        {!!renderLeftToolbar && !tiny && (
          <>
            <Space horizontal size={1} />
            {renderLeftToolbar()}
          </>
        )}
        <Space horizontal size={1} />
        {!!firstId && width > 500 && !tiny && (
          <>
            <LogicalTimestamp sid={firstId.sid ?? 0} time={firstId.time ?? 0} />
            &nbsp;{'–'}&nbsp;
          </>
        )}
        {!tiny && (
          <LogicalTimestamp sid={log.end.clock.sid ?? 0} time={log.end.clock.time ? log.end.clock.time - 1 : 0} />
        )}
      </Flex>
      <div>{toolbar}</div>
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
      <Paper
        round={!!spacious && !tiny}
        noOutline={tiny}
        className={blockClass + (tiny ? tinyBlockClass : '')}
        style={
          tiny
            ? {width: '100%', padding: '8px 0 0', background: 'transparent'}
            : {
                width: '100%',
                background: styles.g(0.95),
                minWidth: 400,
                padding: spacious ? '0 8px 8px 8px' : undefined,
              }
        }
        hoverElevate={!tiny}
      >
        {!!pinnedModel && !tiny && (
          <div
            style={{
              marginBottom: -2,
              // Hide left and right edges near to rounded corners, where the progress bar would look weird
              maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
            }}
          >
            <RunningBackground />
            <Progress glow value={pinnedIdx / state.log.patches.size()} style={{marginTop: -2}} />
          </div>
        )}
        {!!header && (
          <div
            key="header"
            className={headerClass + (tiny ? tinyHeaderClass : '') + (pinnedModel ? pinnedHeaderClass : '')}
            style={{marginTop: tiny ? 0 : spacious ? (pinnedModel ? 6 : 8) : 0}}
          >
            {header}
          </div>
        )}
        {(view === 'timeline' || view === 'model' || view === 'tiny') && <Timeline key="timeline" log={log} />}
        {!tiny && (
          <div key="content" className={contentClass}>
            {content}
          </div>
        )}
      </Paper>
    </context.Provider>
  );
};
