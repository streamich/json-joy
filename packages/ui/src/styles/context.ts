import * as React from 'react';
import {Styles} from './Styles';
import type {StyleTheme} from './types';

const context = React.createContext<Styles>(null!);

interface ProviderProps {
  dark?: boolean;
  theme?: StyleTheme;
  /** If given, CSS variables are written directly onto `el` via inline style. */
  el?: HTMLElement | null;
  children: React.ReactNode;
}

export const Provider: React.FC<ProviderProps> = React.memo(({dark, theme, el, children}) => {
  const value = React.useMemo(() => Styles.make(theme, dark), [dark, theme]);
  const vars = React.useMemo(() => value.toCssVars(), [value]);
  React.useEffect(() => {
    if (!el) return;
    for (const key in vars) el.style.setProperty(key, vars[key]);
    return () => {
      for (const key in vars) el.style.removeProperty(key);
    };
  }, [el, vars]);
  const child = el
    ? children
    : React.createElement('div', {
        style: {display: 'contents', ...(vars as React.CSSProperties)},
        children,
      });
  return React.createElement(context.Provider, {value}, child);
});

export const useStyles = () => React.useContext<Styles>(context);
export const useColors = () => React.useContext<Styles>(context).col;
