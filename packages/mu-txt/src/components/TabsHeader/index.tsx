import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useExplorer} from '../../context';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {FileTabs} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs';
import {PwaInstallButton} from './PwaInstallButton';
import {isMacElectron} from '../../util/host';

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
        before={<div style={{marginLeft: toggle ? 'var(--titlebar-inset-left, 0px)' : 0}}>{toggle}</div>}
        right={<PwaInstallButton />}
        render={() => <div style={{height: Sizes.TabsFadeHeight}} />}
        barStyle={isMacElectron ? {
          borderTopRightRadius: 12,
          borderTopLeftRadius: 12,
        } : undefined}
      />
    </div>
  );
};
