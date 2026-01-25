import * as React from 'react';
import type {StrNode} from 'json-joy/lib/json-crdt/nodes/str/StrNode';
import {NodeCard, type NodeCardProps} from '../NodeCard';
import {ContextItem, ContextSep, ContextPane} from 'nice-ui/lib/4-card/ContextMenu';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {Popup} from 'nice-ui/lib/4-card/Popup';
import {Separator} from 'nice-ui/lib/3-list-item/Separator';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {BasicButton} from 'nice-ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';
import {CopyText} from '../../CopyText';
import {CollaborativeFlexibleInput} from '../../CollaborativeFlexibleInput';

export interface StrNodeCardProps extends NodeCardProps {
  node: StrNode;
}

export const StrNodeCard: React.FC<StrNodeCardProps> = (props) => {
  const [t] = useT();
  const [view, setView] = React.useState<'textual' | 'raw' | 'json' | 'edit'>('textual');

  let viewBtnLabel = t('Textual');
  switch (view) {
    case 'raw':
      viewBtnLabel = t('Raw');
      break;
    case 'edit':
      viewBtnLabel = t('Edit');
      break;
    case 'json':
      viewBtnLabel = t('JSON');
      break;
  }

  const right = props.collapsed ? null : (
    <Popup
      onClick={(e) => {
        e.stopPropagation();
      }}
      style={{margin: '-3px 0'}}
      renderContext={() => (
        <ContextPane minWidth={240}>
          <ContextSep />
          <ContextItem
            closePopup
            inset
            onClick={() => setView('textual')}
            grey={view === 'textual'}
            icon={<Iconista set="elastic" icon="vis_text" width={16} height={16} />}
          >
            {t('Textual')}
          </ContextItem>
          {!props.readonly && (
            <ContextItem closePopup inset onClick={() => setView('edit')} grey={view === 'edit'}>
              {t('Edit')}
            </ContextItem>
          )}
          <ContextItem closePopup inset onClick={() => setView('raw')} grey={view === 'raw'}>
            {t('Raw')}
          </ContextItem>
          <ContextItem closePopup inset onClick={() => setView('json')} grey={view === 'json'}>
            {t('JSON')}
          </ContextItem>
          <ContextSep />
        </ContextPane>
      )}
    >
      <BasicTooltip nowrap renderTooltip={() => t('Model view')}>
        <BasicButton width={'auto'} compact border>
          {viewBtnLabel}
        </BasicButton>
      </BasicTooltip>
    </Popup>
  );

  let content: React.ReactNode = null;

  if (!props.collapsed) {
    switch (view) {
      case 'raw': {
        content = (
          <pre style={{margin: 0, padding: 0, fontSize: '11px'}}>
            <CopyText src={() => props.node.view() + ''} />
          </pre>
        );
        break;
      }
      case 'json': {
        content = (
          <pre style={{margin: 0, padding: 0, fontSize: '11px'}}>
            <CopyText src={() => JSON.stringify(props.node.view())} />
          </pre>
        );
        break;
      }
      case 'edit': {
        content = props.readonly ? null : (
          <pre style={{margin: 0, padding: 0, fontSize: '11px', display: 'block', width: '100%'}}>
            <CollaborativeFlexibleInput focus wrap fullWidth multiline str={() => props.model.api.wrap(props.node)} />
          </pre>
        );
        break;
      }
      default: {
        content = (
          <>
            {!props.readonly && props.node.size() < 256 ? (
              <>
                <pre style={{margin: 0, padding: 0, fontSize: '11px'}}>
                  <CollaborativeFlexibleInput wrap fullWidth multiline str={() => props.model.api.wrap(props.node)} />
                </pre>
                <Space size={-1} />
                <Separator />
                <Space size={-1} />
              </>
            ) : null}
            <pre style={{margin: 0, padding: 0, fontSize: '11px'}}>
              <CopyText src={() => props.node + ''} />
            </pre>
          </>
        );
        break;
      }
    }
  }

  return (
    <NodeCard {...props} right={right}>
      {content}
    </NodeCard>
  );
};
