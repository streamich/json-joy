import * as React from 'react';
import {ContextItem, ContextSep, ContextPane, ContextTitle} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';
import type {JsonCrdtModelState} from './JsonCrdtModelState';
import CubeIcon__svg from 'iconista/lib/react/auth0/cube';
import HooksIcon__svg from 'iconista/lib/react/auth0/hooks';
import VisTextIcon__svg from 'iconista/lib/react/elastic/vis_text';

const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CubeIcon__svg {...props} />;
const HooksIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <HooksIcon__svg {...props} />;
const VisTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <VisTextIcon__svg {...props} />;

export interface ViewSelectProps {
  state: JsonCrdtModelState;
}

export const ViewSelect: React.FC<ViewSelectProps> = ({state}) => {
  const [t] = useT();
  const modelView = useBehaviorSubject(state.modelView$);

  let text = t('Explore');
  switch (modelView) {
    case 'debug':
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
            onClick={() => state.setModelView('interactive')}
            grey={modelView === 'interactive'}
            icon={<CubeIcon width={16} height={16} />}
          >
            {t('Explore')}
          </ContextItem>
          <ContextItem
            closePopup
            inset
            onClick={() => state.setModelView('index')}
            grey={modelView === 'index'}
            icon={<HooksIcon width={16} height={16} />}
          >
            {t('Node index')}
          </ContextItem>
          <ContextItem
            closePopup
            inset
            onClick={() => state.setModelView('debug')}
            grey={modelView === 'debug'}
            icon={<VisTextIcon width={16} height={16} />}
          >
            {t('Textual')}
          </ContextItem>
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextTitle>{t('Structural')}</ContextTitle>
          <ContextItem closePopup inset onClick={() => state.setModelView('binary')} grey={modelView === 'binary'}>
            {t('Binary')}
          </ContextItem>
          <ContextItem closePopup inset onClick={() => state.setModelView('verbose')} grey={modelView === 'verbose'}>
            <Split>
              <span>{t('Verbose')}</span>
              <Sidetip small>{'JSON'}</Sidetip>
            </Split>
          </ContextItem>
          <ContextItem closePopup inset onClick={() => state.setModelView('compact')} grey={modelView === 'compact'}>
            <Split>
              <span>{t('Compact')}</span>
              <Sidetip small>{'JSON'}</Sidetip>
            </Split>
          </ContextItem>
          <ContextSep />
          <ContextSep line />
          <ContextSep />
          <ContextTitle>{t('Other')}</ContextTitle>
          <ContextItem closePopup inset onClick={() => state.setModelView('indexed')} grey={modelView === 'indexed'}>
            {'Indexed'}
          </ContextItem>
          <ContextItem closePopup inset onClick={() => state.setModelView('sidecar')} grey={modelView === 'sidecar'}>
            {'Sidecar'}
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
