import * as React from 'react';

export interface SizeContextState {
  width: number;
  height: number;
  paddingLeft: number;
}

export const context = React.createContext<SizeContextState>({
  width: typeof window === 'object' ? window.innerWidth : 0,
  height: typeof window === 'object' ? window.innerHeight : 0,
  paddingLeft: 0,
});

export const useContentSize = () => React.useContext(context);
