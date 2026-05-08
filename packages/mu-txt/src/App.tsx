import * as React from 'react';
import {rule} from 'nano-theme';
import {UiProvider} from '@jsonjoy.com/ui';
import {AppGrid} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {ErrorBoundary} from '@jsonjoy.com/ui/lib/misc/ErrorBoundary';
import {MainContent} from './components/MainContent';
import {MuTxtAppState} from './state';
import {ctx} from './context';
import {LeftSidebar} from './components/LeftSidebar';
import {useT} from 'use-t';
import {TabsHeader} from './components/TabsHeader';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {FileOptionsContextPane} from './components/LeftSidebar/SavedFileList/FileOptionsContextPane';
import type {FileMetadataDto, OpenFile} from './state/file';
import {host} from './util/host';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup';

const columnClass = rule({
  d: 'flex',
  fld: 'column',
  h: '100%',
  minH: 0,
});

export const App: React.FC = () => {
  const [_t] = useT();
  const state = React.useMemo(() => {
    return new MuTxtAppState();
  }, []);
  const [optionsPane, setOptionsPane] = React.useState<{file: FileMetadataDto; point: AnchorPoint} | null>(null);
  const optionsPaneRef = React.useRef<typeof optionsPane>(null);
  optionsPaneRef.current = optionsPane;
  const wasOpenAtPressDownRef = React.useRef(false);
  React.useEffect(() => {
    const onPress = () => {
      wasOpenAtPressDownRef.current = optionsPaneRef.current !== null;
    };
    document.addEventListener('mousedown', onPress, true);
    document.addEventListener('touchstart', onPress, true);
    return () => {
      document.removeEventListener('mousedown', onPress, true);
      document.removeEventListener('touchstart', onPress, true);
    };
  }, []);
  React.useEffect(() => {
    state.start().catch(() => {});
    return () => {
      state.stop().catch(() => {});
    };
  }, [state]);
  React.useEffect(() => {
    const open = (file: OpenFile, point: AnchorPoint) => {
      if (wasOpenAtPressDownRef.current) return;
      setOptionsPane({file: file.toMeta(), point});
    };
    state.ondoubleclick = open;
    state.onclick = open;
    return () => {
      state.ondoubleclick = void 0;
      state.onclick = void 0;
    };
  }, [state]);

  // Cmd+W in Electron
  React.useEffect(() => host?.onCloseFile(() => state.tabs.deleteSelected()), [state]);

  // Cmd/Ctrl+N: create a new document
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.shiftKey || e.altKey) return;
      if (e.key !== 'n' && e.key !== 'N') return;
      e.preventDefault();
      e.stopPropagation();
      state.createNewMuTxt();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [state]);

  const files = useBehaviorSubject(state.files$);
  const theme = state.theme.resolved.use();

  return (
    <ctx.Provider value={state}>
      <UiProvider theme={theme}>
        <AppGrid
          state={state.appGrid}
          maxLeftSize={500}
          left={(toggle) => (
            <ErrorBoundary name="mutxt:left-sidebar">
              <LeftSidebar toggle={toggle} />
            </ErrorBoundary>
          )}
          // footer={<div> </div>}
          column={(toggle) =>
            <div className={columnClass}>
              <ErrorBoundary name="mutxt:tabs-header" compact>
                <TabsHeader toggle={toggle} />
              </ErrorBoundary>
              <ErrorBoundary name="mutxt:main">
                <MainContent />
              </ErrorBoundary>
            </div>
          }
        />
        {optionsPane && (
          <FileOptionsContextPane
            file={optionsPane.file}
            point={optionsPane.point}
            onClose={() => setOptionsPane(null)}
          />
        )}
      </UiProvider>
    </ctx.Provider>
  );
};
