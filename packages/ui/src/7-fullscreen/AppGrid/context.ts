import {AppGridState} from './state';
import * as React from 'react';

export const ctx = React.createContext<AppGridState>(new AppGridState());
export const useAppGridState = () => React.useContext(ctx);
