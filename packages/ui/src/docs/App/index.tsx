import * as React from 'react';
import {Route} from 'react-router-lite';
import {Services} from '../services/Services';
import {context} from './context';
import {Header} from './Header';
import {GuidelinesPage} from './pages/GuidelinesPage';
import {NiceUiProvider} from '../../context';
import {NiceUiContentService} from '../../context/services/NiceUiContentService';
import {content} from '../content';
import {ComponentsPage} from './pages/ComponentsPage';
import {CustomComponentsProvider} from '../../markdown';
import {custom} from './markdown/custom';
import {IconsPage} from './pages/IconsPage';
import {ThemePage} from './pages/ThemePage';

export type AppProps = {};

export const App: React.FC<AppProps> = () => {
  const service = React.useMemo(() => new Services(), []);
  const contentService = React.useMemo(() => new NiceUiContentService({root: content}), []);

  return (
    <CustomComponentsProvider value={custom}>
      <NiceUiProvider content={contentService}>
        <context.Provider value={service}>
          <Header />
          <Route match={'/guidelines'} render={() => <GuidelinesPage />} />
          <Route match={'/components'} render={() => <ComponentsPage />} />
          <Route match={'/icons'} render={() => <IconsPage />} />
          <Route match={'/theme'} render={() => <ThemePage />} />
        </context.Provider>
      </NiceUiProvider>
    </CustomComponentsProvider>
  );
};
