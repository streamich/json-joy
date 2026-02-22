import * as React from 'react';
import {IconsGridState} from './state';

export const context = React.createContext<IconsGridState>(null!);

export const useIconsGrid = () => React.useContext(context);

export const useSetupIconsGrid = (state?: IconsGridState) =>
  React.useMemo(() => {
    if (state) return state;
    state = new IconsGridState();
    state.load().catch(console.error);
    return state;
  }, [state]);

export interface IconsGridProviderProps {
  children: React.ReactNode;
  state?: IconsGridState;
}

export const IconsGridProvider: React.FC<IconsGridProviderProps> = (props) => {
  const state = useSetupIconsGrid(props.state);
  return <context.Provider value={state}>{props.children}</context.Provider>;
};
