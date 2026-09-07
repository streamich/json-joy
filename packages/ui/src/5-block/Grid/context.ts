import * as React from 'react';
import type {GridState} from './state';

export const ctx = React.createContext<GridState<unknown>>(null!);

export const useGrid = <R = unknown>(): GridState<R> => React.useContext(ctx) as GridState<R>;
