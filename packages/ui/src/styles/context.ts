import * as React from 'react';
import {Styles} from './Styles';
import type {StyleTheme} from './types';

const context = React.createContext<Styles>(null!);

interface ProviderProps {
  dark?: boolean;
  theme?: StyleTheme;
  children: React.ReactNode;
}

export const Provider: React.FC<ProviderProps> = React.memo(({dark, theme, children}) => {
  const value = React.useMemo(() => Styles.make(theme, dark), [dark, theme]);
  return React.createElement(context.Provider, {value, children});
});

export const useStyles = () => React.useContext<Styles>(context);
export const useColors = () => React.useContext<Styles>(context).col;
