import * as React from 'react';
import {AppGrid} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {MainContent} from './components/MainContent';
import {JsonCrdtExplorerState} from './state';
import {ctx} from './context';
import {LeftSidebar} from './components/LeftSidebar';
import {useT} from 'use-t';
import {TabsHeader} from './components/TabsHeader';

export const App: React.FC = () => {
  const [_t] = useT();
  const state = React.useMemo(() => new JsonCrdtExplorerState(), []);
  React.useEffect(() => {
    state.start().catch(() => {});
    return () => {
      state.stop().catch(() => {});
    };
  }, [state]);

  return (
    <ctx.Provider value={state}>
      <AppGrid
        maxLeftSize={500}
        left={(toggle) => <LeftSidebar toggle={toggle} />}
        // footer={<div> </div>}
        column={(toggle) => (
          <>
            <TabsHeader toggle={toggle} />
            <MainContent />
          </>
        )}
      />
    </ctx.Provider>
  );
};
