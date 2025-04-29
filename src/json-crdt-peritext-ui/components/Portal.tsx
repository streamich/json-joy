import * as React from 'react';
import {createPortal} from 'react-dom';
import {context, usePortal} from 'nice-ui/lib/utils/portal/context';
import {PortalState} from 'nice-ui/lib/utils/portal/PortalState';

export interface PortalProps {
  /**
   * The children to render into the portal.
   */
  children: React.ReactNode;

  /**
   * The parent element to render the portal into. If not provided, the portal
   * will be rendered into the body.
   */
  parent?: HTMLElement;
}

export const Portal: React.FC<PortalProps> = ({children, parent}) => {
  const parentState = usePortal();
  const state = React.useMemo(() => {
    const state = new PortalState();
    state.parent = parentState;
    return state;
  }, [parent]);
  const [el] = React.useState(() => document.createElement('div'));
  React.useLayoutEffect(() => {
    const container = parent || document.body;
    container.appendChild(el);
    state.addRoot(el);
    return () => {
      state.delRoot(el);
      container.removeChild(el);
    };
  }, [parent]);

  return <context.Provider value={state}>{createPortal(children, el)}</context.Provider>;
};
