import * as React from 'react';

export interface FocusContextValue {
  focused: string | null;
  pointed: string | null;
  focus: (node: string | null) => void;
  point: (node: string | null) => void;
}

export const context = React.createContext<FocusContextValue>(null!);

export const useFocus = () => React.useContext(context);

export const useIsFocused = (node: string) => {
  const {focused} = useFocus();
  return focused === node;
};

export interface FocusProviderProps {
  children: React.ReactNode;
  onFocus?: (id: string | null) => void;
}

export const FocusProvider: React.FC<FocusProviderProps> = ({children, onFocus}) => {
  const [focused, _focus] = React.useState<string | null>(null);
  const [pointed, point] = React.useState<string | null>(null);

  const focus = React.useCallback(
    (node: string | null) => {
      _focus(node);
      onFocus?.(node);
    },
    [onFocus],
  );

  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')) return;
      if (e.key === 'Escape') focus(null);
    };
    document.addEventListener('keydown', listener, {capture: true, passive: true});
    return () => document.removeEventListener('keydown', listener);
  }, []);

  return <context.Provider value={{focused, focus, pointed, point}}>{children}</context.Provider>;
};
