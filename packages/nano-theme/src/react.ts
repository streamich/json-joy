import * as React from 'react';
import type {Theme} from './types';
import {lightTheme} from './themes/light';
import {darkTheme} from './themes/dark';
import {nano} from './css';

const context = React.createContext<Theme>(lightTheme);

interface ProviderProps {
  theme: 'light' | 'dark';
  children: React.ReactNode;
}

export const Provider: React.FC<ProviderProps> = React.memo(({theme, children}) => {
  const value = theme === 'light' ? lightTheme : darkTheme;
  return React.createElement(context.Provider, {value}, children);
});

export const useTheme = () => React.useContext(context);

type StylerFunction<T extends object> = (theme: T) => object;

export const useRule = (fn: StylerFunction<Theme>): string => {
  const theme = useTheme();
  const css = fn(theme);
  const className = nano.cache!(css);
  return className;
};

export const makeRule = (fn: StylerFunction<Theme>) => () => useRule(fn);

import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';

export const GlobalCss = () => {
  const theme = useTheme();

  useIsomorphicLayoutEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.g(0.05, 0.85);
    document.body.style.setProperty('--jj-heading', theme.g(0.03, 0.97));
  }, [theme]);

  return null;
};
