import * as React from 'react';
import {NiceUiSizes} from '@jsonjoy.com/ui/lib/constants';
import {AppGrid, AppGridColumn} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {Menu} from './components/Menu';
import {MainContent} from './components/MainContent';
import {JsonCrdtExplorerState} from './state';
import {ctx} from './context';
import {ExplorerSidenav} from './components/ExplorerSidenav';

export const App: React.FC = () => {
  const state = React.useMemo(() => new JsonCrdtExplorerState(), []);
    
  return (
    <ctx.Provider value={state}>
      {/* <Menu />
      <div style={{width: 'calc(100vw - 64px)', maxWidth: 1300, margin: '0 auto', padding: '16px 0'}}>
      </div> */}

      <AppGrid
        left={(
          <AppGridColumn header={<div>header</div>} footer={<div>footer</div>} scrollRailWidth={4}>
            <ExplorerSidenav />
          </AppGridColumn>
        )}
        header={<Menu />}
        footer={<div>footer...</div>}
      >
        <MainContent />
      </AppGrid>
    </ctx.Provider>
  );
};
