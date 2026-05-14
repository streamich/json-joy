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
import {ScopedResetContext} from './ScopedResetContext';
import type {NiceUiNavService} from './services/NiceUiNavService';
import type {NiceUiContentService} from './services/NiceUiContentService';

export interface UiProviderProps {
  /** Whether to apply global CSS reset. */
  globalCss?: boolean;
  theme?: 'light' | 'dark';
  nav?: NiceUiNavService;
  content?: NiceUiContentService;
  children: React.ReactNode;
}

export const UiProvider: React.FC<UiProviderProps> = ({globalCss, theme, nav, content, children}) => {
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
  const scopedResetClass = React.useMemo(() => (globalCss ? null : nanoTheme.getScopedResetClass()), [globalCss]);

  return (
    <traces.ctx.Provider value={{}}>
      <context.Provider value={services}>
        <ScopedResetContext.Provider value={scopedResetClass}>
          <nanoTheme.Provider theme={theme ?? (theme2 === 'dark' ? 'dark' : 'light')}>
            <StylesProvider dark={(theme ?? theme2) === 'dark'}>
              <Kbd>
                <ToastsProvider>
                  <PortalProvider>
                    {globalCss && <nanoTheme.GlobalCss />}
                    <contentSize.context.Provider value={contentSize.DEFAULT}>
                      <Router route={pathname}>{children}</Router>
                    </contentSize.context.Provider>
                    <ToastCardManager />
                  </PortalProvider>
                </ToastsProvider>
              </Kbd>
            </StylesProvider>
          </nanoTheme.Provider>
        </ScopedResetContext.Provider>
      </context.Provider>
    </traces.ctx.Provider>
  );
};
