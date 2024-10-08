import * as React from 'react';

export const useIsoLayoutEffect =
  typeof window === 'object' && !!window.document ? React.useLayoutEffect : React.useEffect;

export const useBrowserLayoutEffect =
  typeof window === 'object' && !!window.document ? React.useLayoutEffect : () => {};
