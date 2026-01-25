import * as React from 'react';

export interface InputContextValue {
  /** Whether any input on the page is focused. */
  focused: boolean;
}

export const context = React.createContext<InputContextValue>(null!);

export const useInput = () => React.useContext(context);

export const InputProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const parentContext = useInput();
  const [focused, setFocused] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (parentContext) return;
    const onFocusIn = () => {
      setFocused(!!document.activeElement && document.activeElement.tagName === 'INPUT');
    };
    document.addEventListener('focus', onFocusIn, true);
    document.addEventListener('blur', onFocusIn, true);
    return () => {
      document.removeEventListener('focus', onFocusIn);
      document.removeEventListener('blur', onFocusIn);
    };
  }, []);

  if (parentContext) return children;

  return <context.Provider value={{focused}}>{children}</context.Provider>;
};
