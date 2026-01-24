import * as React from 'react';
import type {NiceUiServices} from './services/NiceUiServices';

export const context = React.createContext<NiceUiServices>(null!);

export const useNiceUiServices = () => React.useContext(context);
