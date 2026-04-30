import * as React from 'react';
import {FileOptionsState} from './state';

export const ctx = React.createContext<FileOptionsState | null>(null);
export const useFileOptions = (): FileOptionsState => {
  const state = React.useContext(ctx);
  if (!state) throw new Error('NO_CTX');
  return state;
};
