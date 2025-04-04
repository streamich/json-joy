import * as React from 'react';
import type {PeritextSurfaceState} from '../state';

export const context = React.createContext<PeritextSurfaceState>(null!);
export const usePeritext = () => React.useContext(context)!;
