import * as React from 'react';
import {AppGrid} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {Menu} from './components/Menu';
import {MainContent} from './components/MainContent';
import {JsonCrdtExplorerState} from './state';
import {ctx} from './context';
import {LeftSidebar} from './components/LeftSidebar';
import {useT} from 'use-t';

export const App: React.FC = () => {
  const [t] = useT();
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
        left={<LeftSidebar />}
        header={<Menu />}
        footer={<div>{' '}</div>}
      >
        <MainContent />
      </AppGrid>
    </ctx.Provider>
  );
};
