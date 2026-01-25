import * as React from 'react';
import type {Services} from '../services/Services';

export const context = React.createContext<Services>(null!);
export const useDocsApp = () => React.useContext(context);
