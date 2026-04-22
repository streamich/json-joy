import * as React from 'react';
import type {MuTxtState} from './controllers/MuTxtState';

export const SlateEditorContext = React.createContext<MuTxtState | null>(null);

export interface SlateEditorContextProviderProps {
  state: MuTxtState;
  children: React.ReactNode;
}

export const SlateEditorContextProvider: React.FC<SlateEditorContextProviderProps> = ({state, children}) =>
  React.createElement(SlateEditorContext.Provider, {value: state}, children);

export const useSlateEditorState = (): MuTxtState => {
  const state = React.useContext(SlateEditorContext);
  if (!state) throw new Error('useSlateEditorState must be used inside SlateEditorContextProvider.');
  return state;
};
