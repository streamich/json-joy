import * as React from 'react';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {ContextItem, ContextSep, ContextPane} from 'nice-ui/lib/4-card/ContextMenu';
import {Popup} from 'nice-ui/lib/4-card/Popup';
import {BasicButton} from 'nice-ui/lib/2-inline-block/BasicButton';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';
import type {JsonCrdtLogState} from './JsonCrdtLogState';

export interface ViewSelectProps {
  state: JsonCrdtLogState;
}

export const ViewSelect: React.FC<ViewSelectProps> = ({state}) => {
  const [t] = useT();
  const view = useBehaviorSubject(state.view$);

  let text = t('Explore');
  switch (view) {
    case 'timeline':
      text = t('Timeline');
      break;
    case 'model':
      text = t('Model');
      break;
    case 'text':
      text = t('Textual');
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
            onClick={() => state.setView('timeline')}
            grey={view === 'timeline'}
            icon={<Iconista set="auth0" icon="chart-bars" width={16} height={16} />}
          >
            {t('Timeline')}
          </ContextItem>
          <ContextItem
            closePopup
            inset
            onClick={() => state.setView('model')}
            grey={view === 'model'}
            icon={<Iconista set="auth0" icon="chart-bars" width={16} height={16} />}
          >
            {t('Timeline with model')}
          </ContextItem>
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
