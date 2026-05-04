import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {FileTabs} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs';
import {PwaInstallButton} from './PwaInstallButton';

const enum Sizes {
  TabsHeight = 48,
  TabsFadeHeight = 16,
}

const blockClass = rule({
  h: Sizes.TabsHeight + 'px',
});

export interface TabsHeaderProps {
  toggle: React.ReactNode;
}

export const TabsHeader: React.FC<TabsHeaderProps> = ({toggle}) => {
  const state = useExplorer();
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div
      className={blockClass}
      style={{
        borderTop: '4px solid ' + theme.bg,
        borderRight: '4px solid ' + theme.bg,
        borderLeft: toggle ? '4px solid ' + theme.bg : void 0,
      }}
    >
      <FileTabs
        bg={styles.g(0.95)}
        fade="transparent"
        state={state.tabs}
        before={<div style={{marginLeft: toggle ? 'env(titlebar-area-x)' : 0}}>{toggle}</div>}
        right={<PwaInstallButton />}
        render={() => <div style={{height: Sizes.TabsFadeHeight}} />}
      />
    </div>
  );
};
