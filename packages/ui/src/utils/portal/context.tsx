import * as React from 'react';
import {PortalState} from './PortalState';

const defaultPortalState = new PortalState();

export const context = React.createContext<PortalState>(defaultPortalState);
export const usePortal = () => React.useContext(context);

export interface PortalProviderProps {
  children: React.ReactNode;
}

export const PortalProvider: React.FC<PortalProviderProps> = ({children}) => {
  const parentState = usePortal();
  const state = React.useMemo(() => {
    const state = new PortalState();
    state.parent = parentState;
    return state;
  }, [parentState]);

  return <context.Provider value={state}>{children}</context.Provider>;
};
