import * as React from 'react';
import type {SlateEditorState} from './state';

export const SlateEditorContext = React.createContext<SlateEditorState | null>(null);

export interface SlateEditorContextProviderProps {
  state: SlateEditorState;
  children: React.ReactNode;
}

export const SlateEditorContextProvider: React.FC<SlateEditorContextProviderProps> = ({state, children}) =>
  React.createElement(SlateEditorContext.Provider, {value: state}, children);

export const useSlateEditorState = (): SlateEditorState => {
  const state = React.useContext(SlateEditorContext);
  if (!state) throw new Error('useSlateEditorState must be used inside SlateEditorContextProvider.');
  return state;
};
