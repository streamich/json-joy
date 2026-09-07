import * as React from 'react';
import type {TreeState} from './state';

export const ctx = React.createContext<TreeState>(null!);

export const useTree = (): TreeState => React.useContext(ctx);
