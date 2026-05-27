import * as React from 'react';

export interface ModalContextValue {
  onClose?: () => void;
}

export const ModalContext = React.createContext<ModalContextValue>({});

export const useModalContext = (): ModalContextValue => React.useContext(ModalContext);
