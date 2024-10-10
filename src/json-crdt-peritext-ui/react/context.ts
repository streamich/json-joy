import * as React from 'react';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {PeritextDOMController} from '../controllers/PeritextDOMController';

export interface PeritextSurfaceContextValue {
  peritext: Peritext;
  dom?: PeritextDOMController;
  debug?: boolean;
  rerender: () => void;
}

export const context = React.createContext<PeritextSurfaceContextValue | null>(null);
export const usePeritext = () => React.useContext(context)!;
