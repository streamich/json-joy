import * as React from 'react';
import {PortalState} from './PortalState';

const defaultPortalState = new PortalState();

export const context = React.createContext<PortalState>(defaultPortalState);
export const usePortal = () => React.useContext(context);

/**
 * Default parent element for portals rendered inside this subtree. When no
 * explicit `parent` prop is passed to `<Portal>`, the portal mounts under
 * this element instead of `document.body`.
 */
export const parentContext = React.createContext<HTMLElement | null>(null);
export const usePortalParent = () => React.useContext(parentContext);
export const PortalParentProvider = parentContext.Provider;

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
