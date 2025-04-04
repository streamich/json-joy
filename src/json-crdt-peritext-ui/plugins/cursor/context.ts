import * as React from 'react';
import {CursorState} from './state';

export const context = React.createContext<CursorState>(null!);
export const useCursorPlugin = () => React.useContext(context);
