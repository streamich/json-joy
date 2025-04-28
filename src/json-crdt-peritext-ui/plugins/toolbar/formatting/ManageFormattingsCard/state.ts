import {BehaviorSubject} from 'rxjs';
import {SavedFormatting} from '../../state/formattings';
import {PersistedSlice} from '../../../../../json-crdt-extensions/peritext/slice/PersistedSlice';
import {subject} from '../../../../util/rx';
import type {Inline} from '../../../../../json-crdt-extensions';
import type {ToolbarState} from '../../state';

export class CaretBottomState {
  public readonly selected$ = new BehaviorSubject<SavedFormatting | null>(null);

  public constructor(
    public readonly state: ToolbarState,
    public readonly inline: Inline | undefined,
  ) {}

  public getFormattings$(inline: Inline | undefined = this.inline): BehaviorSubject<SavedFormatting[]> {
    const state = this.state;
    return subject(state.surface.render$, () => {
      const slices = inline?.p1.layers;
      const res: SavedFormatting[] = [];
      if (!slices) return res;
      const registry = state.txt.editor.getRegistry();
      for (const slice of slices) {
        const tag = slice.type;
        if (typeof tag !== 'number' && typeof tag !== 'string') continue;
        const behavior = registry.get(tag);
        if (!behavior) continue;
        const isConfigurable = !!behavior.schema;
        if (!isConfigurable) continue;
        if (!(slice instanceof PersistedSlice)) continue;
        res.push(new SavedFormatting(behavior, slice, state));
      }
      return res;
    });
  };

  public readonly select = (formatting: SavedFormatting | null) => {
    this.selected$.next(formatting);
  };
}
