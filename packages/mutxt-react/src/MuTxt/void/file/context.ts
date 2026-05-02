import * as React from 'react';
import type {FileButtonState} from './FileButtonState';

export const ctx = React.createContext<FileButtonState | null>(null);

export const useFileButton = (): FileButtonState => {
  const state = React.useContext(ctx);
  if (!state) throw new Error('NO_CTX');
  return state;
};
