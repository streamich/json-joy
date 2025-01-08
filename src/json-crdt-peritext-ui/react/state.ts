import type {PeritextPlugin} from './types';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {DomController} from '../dom/DomController';
import type {PeritextEventDefaults} from '../events/PeritextEventDefaults';

export class PeritextSurfaceState {
  public dom?: DomController = void 0;

  constructor (
    public readonly peritext: Peritext,
    public readonly events: PeritextEventDefaults,
    public readonly rerender: () => void,
    public readonly plugins: PeritextPlugin[],
  ) {}
}
