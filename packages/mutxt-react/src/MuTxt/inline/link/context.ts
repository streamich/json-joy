import * as React from 'react';
import type {LinkButtonState} from './LinkButtonState';

export const ctx = React.createContext<LinkButtonState | null>(null);

export const useLinkButton = (): LinkButtonState => {
  const state = React.useContext(ctx);
  if (!state) throw new Error('NO_CTX');
  return state;
};
