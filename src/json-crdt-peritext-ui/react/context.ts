import * as React from 'react';
import type {PeritextPlugin} from './types';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {DomController} from '../dom/DomController';

export interface PeritextSurfaceContextValue {
  peritext: Peritext;
  renderers: PeritextPlugin[];
  dom: DomController;
  rerender: () => void;
}

export const context = React.createContext<PeritextSurfaceContextValue | null>(null);
export const usePeritext = () => React.useContext(context)!;
