import * as React from 'react';
import {Route} from 'react-router-lite';
import {Services} from '../services/Services';
import {context} from './context';
import {Header} from './Header';
import {GuidelinesPage} from './pages/GuidelinesPage';
import {NiceUiProvider} from 'nice-ui/lib/context';
import {NiceUiContentService} from 'nice-ui/lib/context/services/NiceUiContentService';
import {content} from '../content';
import {ComponentsPage} from './pages/ComponentsPage';
import {CustomComponentsProvider} from 'nice-ui/lib/markdown';
import {custom} from './markdown/custom';
import {ExplorerPage} from './pages/ExplorerPage';

export type AppProps = Record<string, never>;

export const App: React.FC<AppProps> = () => {
  const service = React.useMemo(() => new Services(), []);
  // biome-ignore lint: manually managed dependency list
  const contentService = React.useMemo(() => new NiceUiContentService({root: content}), [content]);

  return (
    <CustomComponentsProvider value={custom}>
      <NiceUiProvider content={contentService}>
        <context.Provider value={service}>
          <Header />
          <Route match={'/explorer'} render={() => <ExplorerPage />} />
          <Route match={'/guidelines'} render={() => <GuidelinesPage />} />
          <Route match={'/components'} render={() => <ComponentsPage />} />
        </context.Provider>
      </NiceUiProvider>
    </CustomComponentsProvider>
  );
};
