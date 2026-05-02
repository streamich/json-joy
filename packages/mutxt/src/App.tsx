import * as React from 'react';
import {rule} from 'nano-theme';
import {AppGrid} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {ErrorBoundary} from '@jsonjoy.com/ui/lib/misc/ErrorBoundary';
import {MainContent} from './components/MainContent';
import {JsonCrdtExplorerState} from './state';
import {ctx} from './context';
import {LeftSidebar} from './components/LeftSidebar';
import {useT} from 'use-t';
import {TabsHeader} from './components/TabsHeader';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';

const columnClass = rule({
  d: 'flex',
  fld: 'column',
  h: '100%',
  minH: 0,
});

export const App: React.FC = () => {
  const [_t] = useT();
  const state = React.useMemo(() => {
    return new JsonCrdtExplorerState();
  }, []);
  React.useEffect(() => {
    state.start().catch(() => {});
    return () => {
      state.stop().catch(() => {});
    };
  }, [state]);
  const files = useBehaviorSubject(state.files$);

  return (
    <ctx.Provider value={state}>
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
    </ctx.Provider>
  );
};
