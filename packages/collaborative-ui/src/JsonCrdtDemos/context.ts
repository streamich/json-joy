import * as React from 'react';
import type {JsonCrdtDemosState} from './JsonCrdtDemosState';

export const context = React.createContext<JsonCrdtDemosState>(null!);

export const useDemos = () => React.useContext(context)!;
