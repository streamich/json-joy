import * as React from 'react';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {useSideBySideSyncState} from './context';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {Checkbox} from '@jsonjoy.com/ui/lib/2-inline-block/Checkbox';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicButtonGroup} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButtonGroup';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';

export const TopBar: React.FC = () => {
  const state = useSideBySideSyncState();
  const autoSync = useBehaviorSubject(state.autoSync$);
  const autoSyncInterval = useBehaviorSubject(state.autoSyncInterval$);
  const [seconds, setSeconds] = React.useState((Math.round(autoSyncInterval / 1000)).toString());

  const commitSeconds = React.useCallback((e: any) => {
    setSeconds((currentSeconds) => {
      const parsed = Number(currentSeconds.trim());
      if (!isNaN(parsed) && parsed > 0) {
        state.setAutoSyncInterval(parsed);
      }
      (e?.target as HTMLInputElement)?.blur?.();
      return (Math.round(state.autoSyncInterval$.getValue() / 1000)).toString();
    });
  }, [state]);

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
        <Flex style={{alignItems: 'center', justifyContent: 'flex-end'}}>
          <Text size={-2} font="ui3" noselect>Auto-sync</Text>
          <Space horizontal />
          <BasicTooltip renderTooltip={() => 'Toggle auto-sync'} nowrap>
            <Checkbox on={autoSync} small onChange={state.toggleAutoSync} />
          </BasicTooltip>
          <Space horizontal />
          <Text size={-2} font="ui3" noselect>every</Text>
          <Space horizontal />
          <div style={{width: 36}}>
            <Input
              center
              value={seconds}
              size={-3}
              onChange={(value) => setSeconds(value)}
              onBlur={commitSeconds}
              onEnter={commitSeconds}
              onEsc={() => {
                setSeconds((Math.round(state.autoSyncInterval$.getValue() / 1000)).toString());
              }}
            />
          </div>
          <Space horizontal />
          <Text size={-2} font="ui3" noselect>seconds</Text>
        </Flex>
      </Split>
    </Paper>
  );
};
