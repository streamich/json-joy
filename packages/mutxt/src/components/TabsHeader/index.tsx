import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {FileTabs} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {FlexibleInput} from 'flexible-input';
import type {OpenFile} from '../../state/file';
import {PwaInstallButton} from './PwaInstallButton';

const enum Sizes {
  TabsHeight = 48,
  TabsFadeHeight = 16,
}

const blockClass = rule({
  h: Sizes.TabsHeight + 'px',
});

const filesHeaderClass = rule({
  pd: '0 8px 0 10px',
  bdrad: '0 0 10px 0',
  h: '40px',
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  fz: '14px',
  // bd: '1px solid blue',
  bgi: 'radial-gradient(circle, rgba(127,127,127,.1) 1px, transparent 1px)',
  bgs: '16px 16px',
  fw: 600,
});

const FileNameHeader: React.FC<{file: OpenFile}> = ({file}) => {
  const state = useExplorer();
  const theme = useTheme();
  const fileName = file.name.use();

  return (
    <div style={{marginTop: -Sizes.TabsFadeHeight}}>
      <div className={filesHeaderClass} style={{backgroundColor: theme.bg, boxShadow: '0 0 10px ' + theme.bg}}>
        <FileIcon id={file.id} label="crdt" size={16} />
        <FlexibleInput minWidth={24} value={fileName} onChange={(e) => state.renameFile(file, e.target.value)} />
      </div>
    </div>
  );
};

export interface TabsHeaderProps {
  toggle: React.ReactNode;
}

export const TabsHeader: React.FC<TabsHeaderProps> = ({toggle}) => {
  const state = useExplorer();
  const styles = useStyles();
  const theme = useTheme();
  const file = useBehaviorSubject(state.file$);

  const fileHeader = file ? <FileNameHeader file={file} /> : null;

  return (
    <div className={blockClass} style={{borderTop: '4px solid ' + theme.bg, borderRight: '4px solid ' + theme.bg}}>
      <FileTabs
        bg={styles.g(0.95)}
        fade="transparent"
        state={state.tabs}
        before={toggle}
        right={<PwaInstallButton />}
        render={() => <div style={{height: Sizes.TabsFadeHeight}} />}
      />
      {fileHeader}
    </div>
  );
};
