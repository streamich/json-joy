import * as React from 'react';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {PeritextDomController} from '../events/PeritextDomController';

export interface PeritextSurfaceContextValue {
  peritext: Peritext;
  dom?: PeritextDomController;
  debug?: boolean;
  rerender: () => void;
}

export const context = React.createContext<PeritextSurfaceContextValue | null>(null);
export const usePeritext = () => React.useContext(context)!;
