import * as React from 'react';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {ContextItem, ContextSep, ContextPane} from 'nice-ui/lib/4-card/ContextMenu';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {Sidetip} from 'nice-ui/lib/1-inline/Sidetip';
import {Popup} from 'nice-ui/lib/4-card/Popup';
import {BasicButton} from 'nice-ui/lib/2-inline-block/BasicButton';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';
import type {JsonCrdtPatchState} from './JsonCrdtPatchState';

export interface ViewSelectProps {
  state: JsonCrdtPatchState;
}

export const ViewSelect: React.FC<ViewSelectProps> = ({state}) => {
  const [t] = useT();
  const view = useBehaviorSubject(state.view$);

  let text = t('Explore');
  switch (view) {
    case 'text':
      text = t('Textual');
      break;
    case 'index':
      text = t('Index');
      break;
    case 'binary':
      text = t('Binary');
      break;
    case 'verbose':
      text = t('Verbose');
      break;
    case 'compact':
      text = t('Compact');
      break;
    case 'indexed':
      text = t('Indexed');
      break;
    case 'sidecar':
      text = t('Sidecar');
      break;
  }

  return (
    <Popup
      renderContext={() => (
        <ContextPane minWidth={240}>
          <ContextSep />
          <ContextItem
            closePopup
            inset
            onClick={() => state.setView('text')}
            grey={view === 'text'}
            icon={<Iconista set="elastic" icon="vis_text" width={16} height={16} />}
          >
            {t('Textual')}
          </ContextItem>
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextItem closePopup inset onClick={() => state.setView('binary')} grey={view === 'binary'}>
            {t('Binary')}
          </ContextItem>
          <ContextItem closePopup inset onClick={() => state.setView('verbose')} grey={view === 'verbose'}>
            <Split>
              <span>{t('Verbose')}</span>
              <Sidetip small>{'JSON'}</Sidetip>
            </Split>
          </ContextItem>
          <ContextItem closePopup inset onClick={() => state.setView('compact')} grey={view === 'compact'}>
            <Split>
              <span>{t('Compact')}</span>
              <Sidetip small>{'JSON'}</Sidetip>
            </Split>
          </ContextItem>
          <ContextSep />
        </ContextPane>
      )}
    >
      <BasicTooltip nowrap renderTooltip={() => t('Model view')}>
        <BasicButton width={'auto'} compact border>
          {text}
        </BasicButton>
      </BasicTooltip>
    </Popup>
  );
};
