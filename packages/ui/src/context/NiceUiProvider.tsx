import * as React from 'react';
import * as contentSize from './content-size';
import * as nanoTheme from 'nano-theme';
import {Router} from '../misc/router';
import {ToastsProvider} from '../7-fullscreen/ToastCardManager/context';
import {context} from './services';
import {NiceUiServices} from './services/NiceUiServices';
import type {NiceUiNavService} from './services/NiceUiNavService';
import type {NiceUiContentService} from './services/NiceUiContentService';
import {useBehaviorSubject} from '../hooks/useBehaviorSubject';
import {ToastCardManager} from '../7-fullscreen/ToastCardManager';
import {Provider as StylesProvider} from '../styles/context';
import {PortalProvider} from '../utils/portal';

import '../misc/global-css';

export interface NiceUiProviderProps {
  theme?: 'light' | 'dark';
  nav?: NiceUiNavService;
  content?: NiceUiContentService;
  children: React.ReactNode;
}

export const NiceUiProvider: React.FC<NiceUiProviderProps> = ({theme, nav, content, children}) => {
  const services = React.useMemo(
    () =>
      new NiceUiServices({
        nav,
        content,
      }),
    [nav, content],
  );
  const pathname = useBehaviorSubject(services.nav.pathname$);
  const theme2 = useBehaviorSubject(services.theme$);

  return (
    <context.Provider value={services}>
      <nanoTheme.Provider theme={theme ?? (theme2 === 'dark' ? 'dark' : 'light')}>
        <StylesProvider dark={theme2 === 'dark'}>
          <ToastsProvider>
            <PortalProvider>
              <nanoTheme.GlobalCss />
              <contentSize.context.Provider value={contentSize.DEFAULT}>
                <Router route={pathname}>{children}</Router>
              </contentSize.context.Provider>
              <ToastCardManager />
            </PortalProvider>
          </ToastsProvider>
        </StylesProvider>
      </nanoTheme.Provider>
    </context.Provider>
  );
};
