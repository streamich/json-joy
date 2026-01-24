import * as React from 'react';

export interface PopupInnerContext {
  close: () => void;
}
export const context = React.createContext<PopupInnerContext | null>(null);
export const usePopup = () => React.useContext(context);
