import * as React from 'react';
import type {JsonCrdtExplorerState} from './state';

export const ctx = React.createContext<JsonCrdtExplorerState>(null!);
export const useExplorer = () => React.useContext(ctx)!;
