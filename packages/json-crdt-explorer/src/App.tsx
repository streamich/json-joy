import * as React from 'react';
import {AppGrid, AppGridColumn} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {Menu} from './components/Menu';
import {MainContent} from './components/MainContent';
import {JsonCrdtExplorerState} from './state';
import {ctx} from './context';
import {ExplorerSidenav} from './components/ExplorerSidenav';
import {useT} from 'use-t';

export const App: React.FC = () => {
  const [t] = useT();
  const state = React.useMemo(() => new JsonCrdtExplorerState(), []);
    
  return (
    <ctx.Provider value={state}>
      <AppGrid
        maxLeftSize={500}
        // minLeftSize={250}
        left={(
          <AppGridColumn header={<h5>{t('Files')}</h5>} footer={<div>{' '}</div>} scrollRailWidth={4}>
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
