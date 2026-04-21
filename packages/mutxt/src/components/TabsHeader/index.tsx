import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {FileTabs} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs';
import {FlexibleInput} from 'flexible-input';
import {PwaInstallButton} from './PwaInstallButton';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {OpenFile} from '../../state/file';

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
  fz: '13.5px',
  // bd: '1px solid blue',
  bgi: 'radial-gradient(circle, rgba(127,127,127,.1) 1px, transparent 1px)',
  bgs: '16px 16px',
  op: .7,
  maskImage: 'linear-gradient(to right, black, transparent)',
  '&:focus-within': {
    op: 1,
    maskImage: 'none',
  },
  // fw: 600,
});

const FileNameHeader: React.FC<{file: OpenFile}> = ({file}) => {
  const state = useExplorer();
  const theme = useTheme();
  const fileName = file.name.use();

  return (
    <div style={{marginTop: -Sizes.TabsFadeHeight}}>
      <div className={filesHeaderClass} style={{backgroundColor: theme.bg, boxShadow: '0 0 10px ' + theme.bg}}>
        {/* <FileIcon id={file.id} label="crdt" size={16} /> */}
        <Iconista set="bootstrap" icon="file-earmark-binary" width={16} height={16} style={{marginBottom: 1}} />
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
    <div className={blockClass} style={{
      borderTop: '4px solid ' + theme.bg,
      borderRight: '4px solid ' + theme.bg,
      borderLeft: toggle ? ('4px solid ' + theme.bg) : void 0,
    }}>
      <FileTabs
        bg={styles.g(0.95)}
        fade="transparent"
        state={state.tabs}
        before={<div style={{marginLeft: !!toggle ? 'env(titlebar-area-x)' : 0}}>{toggle}</div>}
        right={<PwaInstallButton />}
        render={() => <div style={{height: Sizes.TabsFadeHeight}} />}
      />
      {fileHeader}
    </div>
  );
};
