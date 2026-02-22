import * as React from 'react';
import type {ToolbarMenuState} from './state';

export const context = React.createContext<ToolbarMenuState>(null!);
export const useToolbarMenu = () => React.useContext(context);
