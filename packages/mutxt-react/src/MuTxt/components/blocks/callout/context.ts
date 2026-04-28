import * as React from 'react';
import {CalloutOptionsState} from './state';

export const ctx = React.createContext<CalloutOptionsState | null>(null);
export const useCalloutOptions = (): CalloutOptionsState => {
  const state = React.useContext(ctx);
  if (!state) throw new Error('NO_CTX');
  return state;
};
