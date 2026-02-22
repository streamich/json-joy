import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {JsonBlockState} from '../JsonBlockState';

const CodeIcon = makeIcon({set: 'auth0', icon: 'code'});
const PaintBrushIcon = makeIcon({set: 'auth0', icon: 'paint-brush'});
const PencilIcon = makeIcon({set: 'auth0', icon: 'pencil'});
const MergeIcon = makeIcon({set: 'elastic', icon: 'merge'});
const _HighlightIcon = makeIcon({set: 'ant_outline', icon: 'highlight'});

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
          <CodeIcon width={16} height={16} />
        </BasicButton>
      </BasicTooltip>
      <Space horizontal size={-2} />
      <BasicTooltip nowrap renderTooltip={() => t('Colorful')}>
        <BasicButton fill={view === 'json'} compact onClick={() => state.setView('json')}>
          <PaintBrushIcon width={16} height={16} />
          {/* <HighlightIcon width={14} height={14} /> */}
        </BasicButton>
      </BasicTooltip>
      <Space horizontal size={-2} />
      <BasicTooltip nowrap renderTooltip={() => t('Plain text')}>
        <BasicButton fill={view === 'text'} compact onClick={() => state.setView('text')}>
          <PencilIcon width={16} height={16} />
        </BasicButton>
      </BasicTooltip>
      <Space horizontal size={-2} />
      <BasicTooltip nowrap renderTooltip={() => t('Minified')}>
        <BasicButton fill={view === 'minified'} compact onClick={() => state.setView('minified')}>
          <MergeIcon width={16} height={16} />
        </BasicButton>
      </BasicTooltip>
    </>
  );
};
