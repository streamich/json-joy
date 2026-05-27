import * as React from 'react';

const {createContext, useContext, useMemo, useState} = React;

export type ModalRenderer = (close: () => void) => React.ReactNode;

export interface ModalHostValue {
  /**
   * Imperatively mount a modal. `render` receives a `close` callback and returns
   * the modal element to show. Returns a function that unmounts it.
   */
  open: (render: ModalRenderer) => () => void;
}

const ModalHostContext = createContext<ModalHostValue | null>(null);

let counter = 0;

/**
 * Hosts imperatively-opened modals (see {@link useConfirm}). Mount once near the
 * app root; opened modals render as its children and clean themselves up.
 */
export const ModalHostProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [items, setItems] = useState<Array<{id: number; node: React.ReactNode}>>([]);
  const value = useMemo<ModalHostValue>(
    () => ({
      open: (render) => {
        const id = counter++;
        const close = () => setItems((current) => current.filter((item) => item.id !== id));
        setItems((current) => [...current, {id, node: render(close)}]);
        return close;
      },
    }),
    [],
  );
  return (
    <ModalHostContext.Provider value={value}>
      {children}
      {items.map((item) => (
        <React.Fragment key={item.id}>{item.node}</React.Fragment>
      ))}
    </ModalHostContext.Provider>
  );
};

export const useModalHost = (): ModalHostValue => {
  const ctx = useContext(ModalHostContext);
  if (!ctx) throw new Error('useModalHost must be used within a <ModalHostProvider>');
  return ctx;
};
