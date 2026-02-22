import type {Model} from 'json-joy/lib/json-crdt';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {Scrollbox} from '@jsonjoy.com/ui/lib/4-card/Scrollbox';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {ContextItem, ContextSep, ContextPane, ContextTitle} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import * as React from 'react';
import {rule} from 'nano-theme';
import {JsonCrdtModelView} from './JsonCrdtModelView';
import {useT} from 'use-t';
import {JsonCrdtModelClickable} from './JsonCrdtModelClickable';
import {JsonCrdtModelVerbose} from './JsonCrdtModelVerbose';
import {JsonCrdtModelCompact} from './JsonCrdtModelCompact';
import {JsonCrdtModelState} from './JsonCrdtModelState';
import {JsonCrdtModelBinary} from './JsonCrdtModelBinary';
import {JsonCrdtModelIndexed} from './JsonCrdtModelIndexed';
import {JsonCrdtModelSidecar} from './JsonCrdtModelSidecar';
import {ViewSelect} from './ViewSelect';
import {DownloadButton} from './DownloadButton';
import {JsonCrdtModelIndex} from './JsonCrdtModelIndex';
import {JsonCrdtModelTextual} from './JsonCrdtModelTextual';
import {Display, type DisplayProps} from './Display';
import {LogReadonlyLabel} from '../atoms/ReadonlyLabel';
import {ModelLogicalTimestamp} from '../LogicalTimestamp/ModelLogicalTimestamp';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';

const ExternalLinkIcon = makeIcon({set: 'auth0', icon: 'external-link'});

const css = {
  header: rule({
    pad: '8px 8px 8px 16px',
  }),
  content: rule({
    pad: '0 8px 8px',
  }),
};

export interface JsonCrdtModelProps {
  model: Model<any>;
  presence?: PresenceManager;
  readonly?: boolean;
  state?: JsonCrdtModelState;
  filename?: string;
  order?: ('model' | 'view' | 'display')[];
  noDisplayHdr?: boolean;
  renderLeftToolbar?: () => React.ReactNode;
  renderDisplay?: DisplayProps['renderDisplay'];
  renderContext?: () => React.ReactNode;
}

export const JsonCrdtModel: React.FC<JsonCrdtModelProps> = ({
  model,
  presence,
  readonly,
  state: _state,
  filename,
  order = ['model', 'view', 'display'],
  noDisplayHdr,
  renderLeftToolbar,
  renderDisplay,
  renderContext,
}) => {
  const [t] = useT();
  // biome-ignore lint: manual dependency list
  const state = React.useMemo(() => {
    const s = _state ?? new JsonCrdtModelState();
    s.readonly$.next(!!readonly);
    return s;
  }, []);
  const showModel = useBehaviorSubject(state.showModel$);
  const modelView = useBehaviorSubject(state.modelView$);

  const contextMenu = (
    <Popup
      renderContext={() => (
        <ContextPane minWidth={248}>
          <ContextSep />
          <ContextTitle>{t('Panels')}</ContextTitle>
          <ContextItem closePopup inset onClick={state.toggleShowModel}>
            <Split style={{alignItems: 'center'}}>
              <span>{t('Model')}</span>
              <Checkbox as={'span'} small on={state.showModel$.getValue()} onChange={() => {}} />
            </Split>
          </ContextItem>
          <ContextItem closePopup inset onClick={state.toggleShowView}>
            <Split style={{alignItems: 'center'}}>
              <span>{t('View')}</span>
              <Checkbox as={'span'} small on={state.showView$.getValue()} onChange={() => {}} />
            </Split>
          </ContextItem>
          {!!renderDisplay && (
            <ContextItem closePopup inset onClick={state.toggleShowDisplay}>
              <Split style={{alignItems: 'center'}}>
                <span>{t('Display')}</span>
                <Checkbox as={'span'} small on={state.showDisplay$.getValue()} onChange={() => {}} />
              </Split>
            </ContextItem>
          )}
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextItem
            closePopup
            inset
            onClick={() => {
              window.open('https://jsonjoy.com/specs/json-crdt/model-document', '_blank');
            }}
            icon={<ExternalLinkIcon width={16} height={16} />}
          >
            {t('About JSON CRDT model')}
            {' …'}
          </ContextItem>
          <ContextSep />
          {!!renderContext && (
            <>
              <ContextSep line />
              <ContextSep />
              {renderContext()}
              <ContextSep />
            </>
          )}
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
          <MiniTitle>{'Model'}</MiniTitle>
        </div>
        <Space horizontal size={1} />
        <ModelLogicalTimestamp model={model} />
        {!!readonly && showModel && (
          <>
            <Space horizontal size={0} />
            <LogReadonlyLabel />
          </>
        )}
        {!!renderLeftToolbar && (
          <>
            <Space horizontal size={1} />
            {renderLeftToolbar()}
          </>
        )}
      </Flex>
      <div>
        <Flex style={{alignItems: 'center'}}>
          <DownloadButton model={model} filename={filename} />
          <Space horizontal size={-1} />
          {showModel && (
            <>
              <ViewSelect state={state} />
              <Space horizontal size={1} />
            </>
          )}
          {contextMenu}
          <Space horizontal size={-1} />
          <Checkbox as={'span'} small on={showModel} onChange={state.toggleShowModel} />
        </Flex>
      </div>
    </Split>
  );

  let content: React.ReactNode = null;

  switch (modelView) {
    case 'interactive':
      content = <JsonCrdtModelClickable model={model} readonly={readonly} />;
      break;
    case 'index':
      content = <JsonCrdtModelIndex model={model} readonly={readonly} />;
      break;
    case 'verbose':
      content = <JsonCrdtModelVerbose model={model} />;
      break;
    case 'compact':
      content = <JsonCrdtModelCompact model={model} />;
      break;
    case 'binary':
      content = <JsonCrdtModelBinary model={model} />;
      break;
    case 'indexed':
      content = <JsonCrdtModelIndexed model={model} />;
      break;
    case 'sidecar':
      content = <JsonCrdtModelSidecar model={model} />;
      break;
    case 'debug':
      content = <JsonCrdtModelTextual model={model} />;
      break;
  }

  const listItems: React.ReactNode[] = [];
  let i = 0;
  for (const item of order) {
    if (listItems.length > 0) listItems.push(<Separator key={`sep-${i++}`} />);
    if (item === 'model') {
      listItems.push(
        <div key="header" className={css.header}>
          {header}
        </div>,
      );
      if (showModel) {
        listItems.push(
          <Scrollbox key="model" style={{maxHeight: 600}}>
            <div className={css.content}>{content}</div>
          </Scrollbox>,
        );
      }
    } else if (item === 'view') {
      listItems.push(
        <JsonCrdtModelView key="view" readonly={readonly} model={model} state={state} filename={filename} />,
      );
    } else if (item === 'display' && !!renderDisplay) {
      listItems.push(
        <Display
          key="display"
          state={state}
          model={model}
          presence={presence}
          noHeader={noDisplayHdr}
          readonly={readonly}
          renderDisplay={renderDisplay}
        />,
      );
    }
  }

  return React.createElement(Paper, null, listItems);
};
