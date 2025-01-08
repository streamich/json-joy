import type {PeritextPlugin} from './types';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {DomController} from '../dom/DomController';

export class PeritextSurfaceState {
  public dom?: DomController = void 0;

  constructor (
    public readonly peritext: Peritext,
    public readonly plugins: PeritextPlugin[],
    public readonly rerender: () => void,
  ) {}
}
