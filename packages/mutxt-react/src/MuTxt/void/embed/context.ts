import * as React from 'react';
import type {EmbedButtonState} from './EmbedButtonState';

export const ctx = React.createContext<EmbedButtonState | null>(null);

export const useEmbedButton = (): EmbedButtonState => {
  const state = React.useContext(ctx);
  if (!state) throw new Error('NO_CTX');
  return state;
};
