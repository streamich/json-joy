import * as React from 'react';
import type {OnChange} from './types';

export interface ClickableJsonContextValue {
  pfx: string;
  onChange?: OnChange;
}

export const context = React.createContext<ClickableJsonContextValue>(null!);
