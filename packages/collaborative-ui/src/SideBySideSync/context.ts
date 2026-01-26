import * as React from 'react';
import {SideBySideSyncState} from './SideBySideSyncState';

export const context = React.createContext<SideBySideSyncState | null>(null);

export const useSideBySideSyncState = () =>
  React.useContext(context)!;
