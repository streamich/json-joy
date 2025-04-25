import {BehaviorSubject} from 'rxjs';
import {Formatting} from '../../../state/Formatting';
import type {Inline} from '../../../../../../json-crdt-extensions';
import type {ToolbarState} from '../../../state';

export class CaretBottomState {
  public readonly selected$ = new BehaviorSubject<Formatting | null>(null);

  public constructor(
    public readonly state: ToolbarState,
    public readonly inline: Inline | undefined,
  ) {}

  public getFormatting(inline: Inline | undefined = this.inline): Formatting[] {
    const slices = inline?.p1.layers;
    const res: Formatting[] = [];
    if (!slices) return res;
    const registry = this.state.txt.editor.getRegistry();
    for (const slice of slices) {
      const tag = slice.type;
      if (typeof tag !== 'number' && typeof tag !== 'string') continue;
      const behavior = registry.get(tag);
      if (!behavior) continue;
      const isConfigurable = !!behavior.schema;
      if (!isConfigurable) continue;
      res.push(new Formatting(slice, behavior));
    }
    return res;
  };

  public readonly onSelect = (formatting: Formatting) => {
    this.selected$.next(formatting);
  };
}
