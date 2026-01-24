import * as React from 'react';
import {AnchorPointHandle} from './AnchorPointHandle';
import type {AnchorPointComputeSpec} from './types';

export const anchorContext = React.createContext<Pick<AnchorPointHandle, 'get' | 'style' | 'maxHeight'> | null>(null);

export const useAnchorPointHandle = (spec?: AnchorPointComputeSpec) => {
  const handle = React.useMemo(() => new AnchorPointHandle(spec), [spec]);
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
