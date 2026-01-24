import * as React from 'react';
import type {ContextMenuState} from './state';

export const context = React.createContext<ContextMenuState>(null!);
export const useContextMenu = () => React.useContext(context);
