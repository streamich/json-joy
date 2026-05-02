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
  pos: 'relative',
  pd: '0 8px 0 10px',
  bdrad: '0 0 10px 0',
  h: '40px',
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  fz: '13.5px',
  op: 0.7,
  maskImage: 'linear-gradient(to right, black 32px, transparent calc(min(150px, 100%)))',
  '&:hover': {
    op: 1,
    maskImage: 'none',
  },
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
  const inputWrapRef = React.useRef<HTMLDivElement | null>(null);

  // Focus an select new file
  // React.useLayoutEffect(() => {
  //   if (autoFocusedFileIdsRef.current.has(file.id)) return;
  //   if (Date.now() - file.meta.createdAt > NEW_FILE_RENAME_WINDOW_MS) return;
  //   let frameId = 0;
  //   let attempts = 0;
  //   const focusInput = () => {
  //     attempts++;
  //     const input = inputWrapRef.current?.querySelector('input, textarea');
  //     if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
  //       autoFocusedFileIdsRef.current.add(file.id);
  //       input.focus();
  //       input.select();
  //       return;
  //     }
  //     if (attempts < 5) frameId = requestAnimationFrame(focusInput);
  //   };
  //   frameId = requestAnimationFrame(focusInput);
  //   return () => {
  //     if (frameId) cancelAnimationFrame(frameId);
  //   };
  // }, [file.id, file.meta.createdAt]);

  return (
    <div style={{marginTop: -Sizes.TabsFadeHeight}}>
      <div className={filesHeaderClass} style={{backgroundColor: theme.bg, boxShadow: '0 0 10px ' + theme.bg}}>
        {/* <FileIcon id={file.id} label="crdt" size={16} /> */}
        <Iconista set="bootstrap" icon="file-earmark-binary" width={16} height={16} style={{marginBottom: 1}} />
        <div ref={inputWrapRef}>
          <FlexibleInput
            minWidth={24}
            value={fileName}
            onChange={(e) => state.renameFile(file, e.target.value)}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              file.mutxt?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                file.mutxt?.focus();
              }
            }}
          />
        </div>
        {/* Mouse hit area */}
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none'}} />
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
      {fileHeader}
    </div>
  );
};
