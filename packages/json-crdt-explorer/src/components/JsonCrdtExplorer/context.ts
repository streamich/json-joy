import * as React from 'react';
import type {JsonCrdtExplorerState} from './state';

export const context = React.createContext<JsonCrdtExplorerState>(null!);

export const useExplorer = () => React.useContext(context)!;
