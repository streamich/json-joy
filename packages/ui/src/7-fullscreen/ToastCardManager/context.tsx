import * as React from 'react';
import {ToastService} from './services/ToastService';

export const context = React.createContext<ToastService>(new ToastService());

export interface ToastsProviderProps {
  value?: ToastService;
  children: React.ReactNode;
}

export const ToastsProvider: React.FC<ToastsProviderProps> = ({value, children}) => {
  const value2 = React.useMemo(() => value ?? new ToastService(), [value]);

  return <context.Provider value={value2}>{children}</context.Provider>;
};

export const useToasts = () => React.useContext(context);
