import * as React from 'react';
import type {NiceUiNavService} from '../../context/services/NiceUiNavService';

export const context = React.createContext<NiceUiNavService['go']>(() => {});
