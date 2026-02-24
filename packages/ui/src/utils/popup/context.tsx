import * as React from 'react';
import {AnchorPointHandle} from './AnchorPointHandle';
import type {AnchorPointComputeSpec} from './types';

export const anchorContext = React.createContext<Pick<AnchorPointHandle, 'get' | 'style' | 'maxHeight'> | null>(null);

export const useAnchorPointHandle = (spec?: AnchorPointComputeSpec) => {
  // Create the handle once and never recreate it, even when spec changes.
  // Recreating the handle would reset `toggle` to null and cause a position:0,0
  // flash because style() can no longer read the anchor element's bounding rect.
  // Instead, mutate spec in place so the stable handle always has the latest spec.
  const handle = React.useMemo(() => new AnchorPointHandle(spec), []); // eslint-disable-line react-hooks/exhaustive-deps
  handle.spec = spec ?? {};
  React.useEffect(() => {
    const listener = () => handle.style();
    document.addEventListener('scroll', listener);
    window.addEventListener('resize', listener);
    return () => {
      document.removeEventListener('scroll', listener);
      window.removeEventListener('resize', listener);
    };
  }, [handle]);
  return handle;
};

export const useAnchorPoint = () => React.useContext(anchorContext);
