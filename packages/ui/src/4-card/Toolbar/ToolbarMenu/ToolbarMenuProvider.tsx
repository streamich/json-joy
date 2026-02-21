import * as React from 'react';
import {context} from './context';
import {ToolbarMenuState} from './state';
import type {ToolbarMenuProps} from './types';

export interface ToolbarMenuProviderProps extends ToolbarMenuProps {
  children: React.ReactNode;
}

export const ToolbarMenuProvider: React.FC<ToolbarMenuProviderProps> = ({children, ...rest}) => {
  const _menu = rest.menu;
  // biome-ignore lint/correctness/useExhaustiveDependencies: props spread creates new object each render
  const state = React.useMemo(() => new ToolbarMenuState(rest), [rest]);

  return <context.Provider value={state}>{children}</context.Provider>;
};
