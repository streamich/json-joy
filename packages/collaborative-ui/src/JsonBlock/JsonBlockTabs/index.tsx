import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton} from 'nice-ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from 'nice-ui/lib/4-card/BasicTooltip';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import type {JsonBlockState} from '../JsonBlockState';

export interface JsonBlockTabsProps {
  state: JsonBlockState;
}

export const JsonBlockTabs: React.FC<JsonBlockTabsProps> = ({state}) => {
  const [t] = useT();
  const view = useBehaviorSubject(state.view$);

  return (
    <>
      <BasicTooltip nowrap renderTooltip={() => t('Interactive')}>
        <BasicButton fill={view === 'interactive'} compact onClick={() => state.setView('interactive')}>
          <Iconista set="auth0" icon="code" width={16} height={16} />
        </BasicButton>
      </BasicTooltip>
      <Space horizontal size={-2} />
      <BasicTooltip nowrap renderTooltip={() => t('Colorful')}>
        <BasicButton fill={view === 'json'} compact onClick={() => state.setView('json')}>
          <Iconista set="auth0" icon="paint-brush" width={16} height={16} />
          {/* <Iconista set="ant_outline" icon="highlight" width={14} height={14} /> */}
        </BasicButton>
      </BasicTooltip>
      <Space horizontal size={-2} />
      <BasicTooltip nowrap renderTooltip={() => t('Plain text')}>
        <BasicButton fill={view === 'text'} compact onClick={() => state.setView('text')}>
          <Iconista set="auth0" icon="pencil" width={16} height={16} />
        </BasicButton>
      </BasicTooltip>
      <Space horizontal size={-2} />
      <BasicTooltip nowrap renderTooltip={() => t('Minified')}>
        <BasicButton fill={view === 'minified'} compact onClick={() => state.setView('minified')}>
          <Iconista set="elastic" icon="merge" width={16} height={16} />
        </BasicButton>
      </BasicTooltip>
    </>
  );
};
