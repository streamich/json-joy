import * as React from 'react';
import {JsonCrdtExplorer} from '@jsonjoy.com/collaborative-ui/lib/JsonCrdtExplorer';
import {NiceUiSizes} from '@jsonjoy.com/ui/lib/constants';
import {AppGrid, AppGridColumn} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {Menu} from './Menu';

export const App: React.FC = () => {
  return (
    <>
      {/* <Menu />
      <div style={{width: 'calc(100vw - 64px)', maxWidth: 1300, margin: '0 auto', padding: '16px 0'}}>
      </div> */}

      <AppGrid
        left={(
          <AppGridColumn header={<div>header</div>} footer={<div>footer</div>} scrollRailWidth={4}>
            <div>sidebar</div>
          </AppGridColumn>
        )}
        header={<Menu />}
      >
        <JsonCrdtExplorer top={NiceUiSizes.TopNavHeight + 32} />
      </AppGrid>
    </>
  );
};
