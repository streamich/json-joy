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
import {FileOptionsDrawer} from './components/LeftSidebar/SavedFileList/FileOptionsDrawer';
import type {FileMetadataDto} from './state/file';

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
  const [drawerFile, setDrawerFile] = React.useState<FileMetadataDto | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  React.useEffect(() => {
    state.start().catch(() => {});
    return () => {
      state.stop().catch(() => {});
    };
  }, [state]);
  React.useEffect(() => {
    state.ondoubleclick = (file) => {
      setDrawerFile(file.toMeta());
      setDrawerOpen(true);
    };
    return () => {
      state.ondoubleclick = void 0;
    };
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
            files.length === 0 ? (
              <ErrorBoundary name="mutxt:main">
                <MainContent />
              </ErrorBoundary>
            ) : (
              <div className={columnClass}>
                <ErrorBoundary name="mutxt:tabs-header" compact>
                  <TabsHeader toggle={toggle} />
                </ErrorBoundary>
                <ErrorBoundary name="mutxt:main">
                  <MainContent />
                </ErrorBoundary>
              </div>
            )
          }
        />
        {drawerFile && <FileOptionsDrawer file={drawerFile} open={drawerOpen} onClose={() => setDrawerOpen(false)} />}
      </UiProvider>
    </ctx.Provider>
  );
};
