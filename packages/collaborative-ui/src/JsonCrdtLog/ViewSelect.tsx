import * as React from 'react';
import {ContextItem, ContextSep, ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';
import type {JsonCrdtLogState} from './JsonCrdtLogState';
import TinyIcon__svg from 'iconista/lib/react/ibm_16/subtract';
import ChartBarsIcon__svg from 'iconista/lib/react/auth0/chart-bars';
import VisTextIcon__svg from 'iconista/lib/react/elastic/vis_text';

const TinyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TinyIcon__svg {...props} />;
const ChartBarsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChartBarsIcon__svg {...props} />;
const VisTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <VisTextIcon__svg {...props} />;

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
    case 'tiny':
      text = t('Tiny');
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
            onClick={() => state.setView('tiny')}
            grey={view === 'tiny'}
            icon={<TinyIcon width={16} height={16} />}
          >
            {t('Tiny')}
          </ContextItem>
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextItem
            closePopup
            inset
            onClick={() => state.setView('timeline')}
            grey={view === 'timeline'}
            icon={<ChartBarsIcon width={16} height={16} />}
          >
            {t('Timeline')}
          </ContextItem>
          <ContextItem
            closePopup
            inset
            onClick={() => state.setView('model')}
            grey={view === 'model'}
            icon={<ChartBarsIcon width={16} height={16} />}
          >
            {t('Timeline with model')}
          </ContextItem>
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextItem
            closePopup
            inset
            onClick={() => state.setView('text')}
            grey={view === 'text'}
            icon={<VisTextIcon width={16} height={16} />}
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
