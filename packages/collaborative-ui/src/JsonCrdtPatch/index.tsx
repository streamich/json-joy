import type {Patch} from 'json-joy/lib/json-crdt';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {ContextItem, ContextSep, ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {TextBlock} from '../TextBlock';
import {LogicalTimestamp} from '../LogicalTimestamp';
import {JsonCrdtPatchState} from './JsonCrdtPatchState';
import {ViewSelect} from './ViewSelect';
import {DownloadButton} from './DownloadButton';
import {JsonCrdtPatchBinary} from './JsonCrdtPatchBinary';
import {JsonCrdtPatchVerbose} from './JsonCrdtPatchVerbose';
import {JsonCrdtPatchCompact} from './JsonCrdtPatchCompact';

const css = {
  header: rule({
    pad: '8px 8px 8px 16px',
  }),
  content: rule({
    pad: '0 8px 8px',
  }),
};

export interface JsonCrdtPatchProps {
  patch: Patch;
  state?: JsonCrdtPatchState;
  pinned?: string;
  filename?: string;
}

export const JsonCrdtPatch: React.FC<JsonCrdtPatchProps> = ({patch, state: _state, pinned, filename}) => {
  const [t] = useT();
  const state = React.useMemo(() => _state ?? new JsonCrdtPatchState(), [_state]);
  const show = useBehaviorSubject(state.show$);
  const view = useBehaviorSubject(state.view$);

  const contextMenu = (
    <Popup
      renderContext={() => (
        <ContextPane minWidth={240}>
          <ContextSep />
          <ContextItem
            closePopup
            inset
            onClick={() => {
              window.open('https://jsonjoy.com/specs/json-crdt-patch', '_blank');
            }}
            icon={<Iconista set="auth0" icon="external-link" width={16} height={16} />}
          >
            {t('About JSON CRDT Patch')}
            {' …'}
          </ContextItem>
          <ContextSep />
        </ContextPane>
      )}
    >
      <BasicTooltip nowrap renderTooltip={() => t('Options')}>
        <BasicButtonMore />
      </BasicTooltip>
    </Popup>
  );

  const header = (
    <Split style={{alignItems: 'center'}}>
      <Flex style={{alignItems: 'center'}}>
        <div style={{marginTop: -1}}>
          <MiniTitle>{t('Patch')}</MiniTitle>
        </div>
        <Space horizontal size={1} />
        <LogicalTimestamp sid={patch.getId()?.sid ?? 0} time={patch.getId()?.time ?? 0} />
      </Flex>
      <div>
        <Flex style={{alignItems: 'center'}}>
          <DownloadButton patch={patch} filename={filename} />
          <Space horizontal size={-1} />
          {show && (
            <>
              <ViewSelect state={state} />
              <Space horizontal size={1} />
            </>
          )}
          {contextMenu}
          <Space horizontal size={-1} />
          <Checkbox as={'span'} small on={show} onChange={state.toggleShow} />
        </Flex>
      </div>
    </Split>
  );

  let content: React.ReactNode = null;

  switch (view) {
    case 'text':
      content = <TextBlock compact src={patch.toString()} />;
      break;
    case 'binary':
      content = <JsonCrdtPatchBinary patch={patch} />;
      break;
    case 'verbose':
      content = <JsonCrdtPatchVerbose patch={patch} />;
      break;
    case 'compact':
      content = <JsonCrdtPatchCompact patch={patch} />;
      break;
  }

  return (
    <Paper style={{borderTop: pinned ? `3px solid ${pinned}` : undefined}} contrast>
      <div className={css.header}>{header}</div>
      {show && <div className={css.content}>{content}</div>}
    </Paper>
  );
};
