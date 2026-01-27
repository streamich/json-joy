import * as React from 'react';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useSideBySideSyncState} from './context';
import {JsonCrdtModelProps} from '../JsonCrdtModel';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonGroup} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButtonGroup';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
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
      <Split>
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
        {/* <Text as='div'> */}
          <Flex style={{flexDirection: 'row-reverse', alignItems: 'center'}}>
            <Text size={-2} font="ui3" noselect>seconds</Text>
            <Space horizontal />
            <div style={{width: 36}}>
              <Input
                center
                // value={state.autoSyncInterval}
                value={'5'}
                size={-3}
              />
            </div>
            <Space horizontal />
            <Text size={-2} font="ui3" noselect>every</Text>
            <Space horizontal />
            <Checkbox on={true} small />
            <Space horizontal />
            <Text size={-2} font="ui3" noselect>Auto-sync</Text>
          </Flex>
        {/* </Text> */}
      </Split>
    </Paper>
  );
};
