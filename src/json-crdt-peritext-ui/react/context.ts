import * as React from 'react';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {SelectionController} from '../controllers/SelectionController';

export interface PeritextSurfaceContextValue {
  peritext: Peritext;
  dom?: SelectionController;
  debug?: boolean;
  rerender: () => void;
}

export const context = React.createContext<PeritextSurfaceContextValue | null>(null);
export const usePeritext = () => React.useContext(context)!;
