import * as React from 'react';
import type {FormattingManageState} from './state';

export const context = React.createContext<FormattingManageState>(null!);
export const useFormattingPane = () => React.useContext(context);
