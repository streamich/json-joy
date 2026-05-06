import * as React from 'react';
import type {MuTxtAppState} from './state';

export const ctx = React.createContext<MuTxtAppState>(null!);
export const useExplorer = () => React.useContext(ctx)!;
