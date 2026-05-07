import * as React from 'react';
import * as contentSize from './content-size';
import * as nanoTheme from 'nano-theme';
import * as traces from './traces';
import {Router} from '../misc/router';
import {ToastsProvider} from '../7-fullscreen/ToastCardManager/context';
import {context} from './services';
import {NiceUiServices} from './services/NiceUiServices';
import {Kbd} from './kbd';
import {useBehaviorSubject} from '../hooks/useBehaviorSubject';
import {ToastCardManager} from '../7-fullscreen/ToastCardManager';
import {Provider as StylesProvider} from '../styles/context';
import {PortalProvider} from '../utils/portal';
import type {NiceUiNavService} from './services/NiceUiNavService';
import type {NiceUiContentService} from './services/NiceUiContentService';

import '../misc/global-css';

export interface UiProviderProps {
  theme?: 'light' | 'dark';
  nav?: NiceUiNavService;
  content?: NiceUiContentService;
  children: React.ReactNode;
}

export const UiProvider: React.FC<UiProviderProps> = ({theme, nav, content, children}) => {
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
    <traces.ctx.Provider value={{}}>
      <context.Provider value={services}>
        <nanoTheme.Provider theme={theme ?? (theme2 === 'dark' ? 'dark' : 'light')}>
          <StylesProvider dark={(theme ?? theme2) === 'dark'}>
            <Kbd>
              <ToastsProvider>
                <PortalProvider>
                  <nanoTheme.GlobalCss />
                  <contentSize.context.Provider value={contentSize.DEFAULT}>
                    <Router route={pathname}>{children}</Router>
                  </contentSize.context.Provider>
                  <ToastCardManager />
                </PortalProvider>
              </ToastsProvider>
            </Kbd>
          </StylesProvider>
        </nanoTheme.Provider>
      </context.Provider>
    </traces.ctx.Provider>
  );
};
