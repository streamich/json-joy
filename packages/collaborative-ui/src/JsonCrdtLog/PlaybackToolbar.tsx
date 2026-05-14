import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {PlayIcon} from '../icons/PlayIcon';
import {PauseIcon} from '../icons/PauseIcon';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import type {JsonCrdtLogState} from './JsonCrdtLogState';
import VerticalLeftIcon__svg from 'iconista/lib/react/lineicons/previous-step-2';
import VerticalRightIcon__svg from 'iconista/lib/react/lineicons/next-step-2';

const VerticalLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <VerticalLeftIcon__svg {...props} />;
const VerticalRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <VerticalRightIcon__svg {...props} />;

export interface PlaybackToolbarProps {
  state: JsonCrdtLogState;
}

export const PlaybackToolbar: React.FC<PlaybackToolbarProps> = ({state}) => {
  const [t] = useT();
  const pinnedModel = useBehaviorSubject(state.pinnedModel$);
  const view = useBehaviorSubject(state.view$);

  if (view !== 'timeline' && view !== 'model' && view !== 'tiny') return null;

  return (
    <>
      {!!pinnedModel && (
        <>
          <BasicTooltip nowrap renderTooltip={() => t('Previous')}>
            <BasicButton fill onClick={state.prev}>
              <VerticalLeftIcon width={16} height={16} />
            </BasicButton>
          </BasicTooltip>
          <Space horizontal size={-5} />
          <BasicTooltip nowrap renderTooltip={() => t('Next')}>
            <BasicButton fill onClick={state.next}>
              <VerticalRightIcon width={16} height={16} />
            </BasicButton>
          </BasicTooltip>
        </>
      )}
      <Space horizontal size={-2} />
      <BasicTooltip nowrap renderTooltip={() => (pinnedModel ? t('Unpin') : t('Pin latest state'))}>
        <BasicButton fill={!!pinnedModel} onClick={state.togglePlay}>
          {pinnedModel ? <PlayIcon width={12} height={12} /> : <PauseIcon width={12} height={12} />}
        </BasicButton>
      </BasicTooltip>
    </>
  );
};
