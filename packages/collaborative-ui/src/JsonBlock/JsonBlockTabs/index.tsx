import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import type {JsonBlockState} from '../JsonBlockState';
import CodeIcon__svg from 'iconista/lib/react/auth0/code';
import PaintBrushIcon__svg from 'iconista/lib/react/auth0/paint-brush';
import PencilIcon__svg from 'iconista/lib/react/auth0/pencil';
import MergeIcon__svg from 'iconista/lib/react/elastic/merge';
import _HighlightIcon__svg from 'iconista/lib/react/ant_outline/highlight';

const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CodeIcon__svg {...props} />;
const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PaintBrushIcon__svg {...props} />;
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PencilIcon__svg {...props} />;
const MergeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MergeIcon__svg {...props} />;
const _HighlightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <_HighlightIcon__svg {...props} />;

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
