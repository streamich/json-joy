import * as React from 'react';
import {createPortal} from 'react-dom';
import {context, usePortal, usePortalParent} from './context';
import {PortalState} from './PortalState';
import {useHiddenTrace} from '../../context';
import {useScopedResetClass} from '../../context/ScopedResetContext';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';

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

  /** Extra class name applied to the portal's container `<div>`. */
  className?: string;
}

export const Portal: React.FC<PortalProps> = ({children, parent, className}) => {
  const parentState = usePortal();
  const defaultParent = usePortalParent();
  const scopedResetClass = useScopedResetClass();
  const state = React.useMemo(() => {
    const state = new PortalState();
    state.parent = parentState;
    return state;
  }, [parentState]);
  const [el] = React.useState(() => document.createElement('div'));
  const hidden = useHiddenTrace();
  useIsomorphicLayoutEffect(() => {
    const style = el.style;
    if (style.display !== 'none' && hidden) style.display = 'none';
    else if (style.display === 'none' && !hidden) style.display = '';
  }, [hidden, el]);
  useIsomorphicLayoutEffect(() => {
    const next = [scopedResetClass, className].filter(Boolean).join(' ');
    if (el.className !== next) el.className = next;
  }, [el, scopedResetClass, className]);

  React.useLayoutEffect(() => {
    const container = parent || defaultParent || document.body;
    container.appendChild(el);
    state.addRoot(el);
    return () => {
      try {
        state.delRoot(el);
        container.removeChild(el);
      } catch {}
    };
  }, [parent, defaultParent, el, state.addRoot, state.delRoot]);

  return <context.Provider value={state}>{createPortal(children, el)}</context.Provider>;
};
