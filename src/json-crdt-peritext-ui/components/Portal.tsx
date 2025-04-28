import * as React from 'react';
import {createPortal} from 'react-dom';
import {context, usePortal} from 'nice-ui/lib/utils/portal/context';
import {PortalState} from 'nice-ui/lib/utils/portal/PortalState';

export interface PortalProps {
  /**
   * The children to render into the portal.
   */
  children: React.ReactNode;
}

export const Portal: React.FC<PortalProps> = ({children}) => {
  const parentState = usePortal();
  const state = React.useMemo(() => {
    const state = new PortalState();
    state.parent = parentState;
    return state;
  }, []);
  const [el] = React.useState(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    state.addRoot(el);
    return el;
  });
  React.useEffect(() => {
    return () => {
      state.delRoot(el);
      document.body.removeChild(el);
    };
  }, []);

  return <context.Provider value={state}>{createPortal(children, el)}</context.Provider>;
};
