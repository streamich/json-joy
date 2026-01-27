import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useSideBySideSyncState} from './context';
import {JsonCrdtModelProps} from '../JsonCrdtModel';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonGroup} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButtonGroup';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import type {Model} from 'json-joy/lib/json-crdt';

export interface TopBarProps {
  model: Model<any>;
  renderDisplay?: JsonCrdtModelProps['renderDisplay'];
}

export const TopBar: React.FC<Omit<TopBarProps, 'model'>> = ({renderDisplay}) => {
  const state = useSideBySideSyncState();

  return (
    <Paper contrast style={{margin: '-1px -1px 2px', padding: 16}}>
      <Flex style={{alignItems: 'center'}}>
        <BasicTooltip renderTooltip={() => 'Synchronize models both ways'} nowrap>
          <Button size={-2} compact onClick={state.synchronize}>Synchronize</Button>
        </BasicTooltip>
        <Space horizontal />
        <BasicButtonGroup>
          <BasicTooltip renderTooltip={() => 'Sync right-to-left'} nowrap>
            <BasicButton fill width="auto" compact onClick={state.syncRightToLeft}>
              ←
            </BasicButton>
          </BasicTooltip>
          <BasicTooltip renderTooltip={() => 'Sync left-to-right'} nowrap>
            <BasicButton fill width="auto" compact onClick={state.syncLeftToRight}>
              →
            </BasicButton>
          </BasicTooltip>
        </BasicButtonGroup>
      </Flex>
    </Paper>
  );
};
