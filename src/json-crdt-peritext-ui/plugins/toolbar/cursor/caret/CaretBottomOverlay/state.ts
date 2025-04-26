import {BehaviorSubject} from 'rxjs';
import {SliceFormatting} from '../../../state/formattings';
import {PersistedSlice} from '../../../../../../json-crdt-extensions/peritext/slice/PersistedSlice';
import type {Inline} from '../../../../../../json-crdt-extensions';
import type {ToolbarState} from '../../../state';

export class CaretBottomState {
  public readonly selected$ = new BehaviorSubject<SliceFormatting | null>(null);

  public constructor(
    public readonly state: ToolbarState,
    public readonly inline: Inline | undefined,
  ) {}

  public getFormatting(inline: Inline | undefined = this.inline): SliceFormatting[] {
    const slices = inline?.p1.layers;
    const res: SliceFormatting[] = [];
    if (!slices) return res;
    const registry = this.state.txt.editor.getRegistry();
    for (const slice of slices) {
      const tag = slice.type;
      if (typeof tag !== 'number' && typeof tag !== 'string') continue;
      const behavior = registry.get(tag);
      if (!behavior) continue;
      const isConfigurable = !!behavior.schema;
      if (!isConfigurable) continue;
      if (!(slice instanceof PersistedSlice)) continue;
      res.push(new SliceFormatting(behavior, slice));
    }
    return res;
  };

  public readonly select = (formatting: SliceFormatting | null) => {
    this.selected$.next(formatting);
  };
}
