import * as React from 'react';
import type {JsonCrdtLogState} from './JsonCrdtLogState';

export const context = React.createContext<JsonCrdtLogState | null>(null);

export const useLogState = () => React.useContext(context)!;
