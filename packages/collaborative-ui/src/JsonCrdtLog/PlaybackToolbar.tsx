import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {PlayIcon} from '../icons/PlayIcon';
import {PauseIcon} from '../icons/PauseIcon';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import type {JsonCrdtLogState} from './JsonCrdtLogState';

export interface PlaybackToolbarProps {
  state: JsonCrdtLogState;
}

export const PlaybackToolbar: React.FC<PlaybackToolbarProps> = ({state}) => {
  const [t] = useT();
  const pinnedModel = useBehaviorSubject(state.pinnedModel$);
  const view = useBehaviorSubject(state.view$);

  if (view !== 'timeline' && view !== 'model') return null;

  return (
    <>
      {!!pinnedModel && (
        <>
          <BasicTooltip nowrap renderTooltip={() => t('Pin previous state')}>
            <BasicButton onClick={state.prev}>
              <Iconista set="ant_outline" icon="vertical-right" width={16} height={16} />
            </BasicButton>
          </BasicTooltip>
          <BasicTooltip nowrap renderTooltip={() => t('Pin next state')}>
            <BasicButton onClick={state.next}>
              <Iconista set="ant_outline" icon="vertical-left" width={16} height={16} />
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
