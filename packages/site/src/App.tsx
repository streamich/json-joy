import * as React from 'react';
import {UiProvider} from '@jsonjoy.com/ui/lib/context';
import {Menu} from './Menu';
import type {PagesService} from './services/PagesService';

export interface AppProps {
  pages: PagesService;
}

export const App: React.FC<AppProps> = ({pages}) => {
  const [Page, setPage] = React.useState<React.FC>(() => pages.page$.getValue());

  React.useEffect(() => {
    const sub = pages.page$.subscribe((component) => setPage(() => component));
    return () => sub.unsubscribe();
  }, [pages]);

  return (
    <UiProvider nav={pages.nav}>
      <Menu nav={pages.nav} />
      <Page />
    </UiProvider>
  );
};
