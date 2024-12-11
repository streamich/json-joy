import type {PeritextPlugin} from './types';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {DomController} from '../dom/DomController';

export class PeritextSurfaceState {
  constructor (
    public readonly peritext: Peritext,
    public readonly plugins: PeritextPlugin[],
    public readonly dom: DomController,
    public readonly rerender: () => void,
  ) {}
}
