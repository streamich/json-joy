import * as React from 'react';
import {AppGrid} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {Menu} from './components/Menu';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {MainContent} from './components/MainContent';
import {JsonCrdtExplorerState} from './state';
import {ctx} from './context';
import {LeftSidebar} from './components/LeftSidebar';
import {useT} from 'use-t';
import {FileTabs} from '@jsonjoy.com/ui/lib/3-list-item/FileTabs';

export const App: React.FC = () => {
  const styles = useStyles();
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
        scrollHeader={(
          <div style={{padding: '2px 0 0', height: 48}}>
            {/* <FileTabs bg={'#d6f0e0'} state={state.tabs} render={() => <div style={{height: '8px'}} />} /> */}
            <FileTabs bg={styles.g(.95)} fade="transparent" state={state.tabs} render={() => <div style={{height: '16px'}} />} />
          </div>
        )}
        footer={<div>{' '}</div>}
      >
        <MainContent />
      </AppGrid>
    </ctx.Provider>
  );
};
