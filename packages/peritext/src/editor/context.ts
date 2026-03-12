import * as React from 'react';
import type {EditorState} from './state';

export const context = React.createContext<EditorState>(null!);
export const useEditor = () => React.useContext(context);
