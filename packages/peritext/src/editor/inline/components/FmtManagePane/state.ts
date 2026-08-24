import {SavedFmt} from '../../../state/formattings';
import {SynthFmt} from '../../../state/formattings/SynthFmt';
import {Slice} from 'json-joy/lib/json-crdt-extensions/peritext/slice/Slice';
import {JsonCrdtDiff} from 'json-joy/lib/json-crdt-diff/JsonCrdtDiff';
import * as str from '@jsonjoy.com/diff/lib/str';
import * as sync from 'thingies/lib/sync';
import type {Inline} from 'json-joy/lib/json-crdt-extensions';
import type {EditorState} from '../../../state';
import type {KeyContext, Key} from '@jsonjoy.com/keyboard';

export class FmtManagePaneState {
  public readonly selected = sync.val<SavedFmt | null>(null);
  public readonly view = sync.val<'view' | 'edit'>('view');
  public readonly editing = sync.val<SynthFmt | undefined>(undefined);
  public readonly kbd: KeyContext;

  public constructor(
    public readonly state: EditorState,
    public readonly inline: Inline | undefined,
    kbd: KeyContext = state.surface.headless.kbd,
  ) {
    this.kbd = kbd.child('fmt');
    this.kbd.focus();

    this.kbd.bind([
      [
        'Escape',
        (press: Key) => {
          if (this.view.value === 'edit') {
            this.switchToViewPanel();
          } else {
            press.propagate = true;
          }
        },
      ],
    ]);
  }

  public dispose(): void {
    this.kbd.dispose();
  }

  public getFormattings$(inline: Inline | undefined = this.inline): sync.Computed<SavedFmt[]> {
    const state = this.state;
    const computed = sync.comp([state.surface.renders], () => {
      const slices = inline?.p1.layers;
      const res: SavedFmt[] = [];
      if (!slices) return res;
      for (const slice of slices) {
        if (slice.isMarker()) continue;
        if (!slice.isSaved()) continue;
        const tag = slice.type();
        if (typeof tag !== 'number' && typeof tag !== 'string') continue;
        const behavior = state.spanMap[tag];
        if (!behavior) continue;
        const isConfigurable = !!behavior.schema;
        if (!isConfigurable) continue;
        if (!(slice instanceof Slice)) continue;
        res.push(new SavedFmt(behavior, slice, state));
      }
      return res;
    });
    return computed;
  }

  public readonly select = (formatting: SavedFmt | null) => {
    this.selected.next(formatting);
  };

  public readonly switchToViewPanel = (): void => {
    this.view.next('view');
    this.editing.next(void 0);
  };

  public readonly switchToEditPanel = (): void => {
    const selected = this.selected.value;
    if (!selected) return;
    this.view.next('edit');
    const formatting = new SynthFmt(selected);
    this.editing.next(formatting);
  };

  public readonly onSave = (): void => {
    const fmt = this.editing.value;
    if (!fmt) return;
    const original = fmt.saved;
    const range = original.range;
    const model = range.txt.model;
    const differ = new JsonCrdtDiff(model);
    const newData = fmt.conf()?.view();
    const originalData = original.conf();
    if (originalData && newData && typeof newData === 'object') {
      differ.diffAny(originalData.node, newData);
    }
    const originalText = range.text();
    const newText = fmt.str.value;
    if (originalText !== newText) {
      const patch = str.diff(originalText, newText);
      if (patch.length) differ.applyStrPatch(patch, range.txt.strApi().node, range.start.id, originalText.length);
    }
    const patch = differ.builder.flush();
    if (patch.ops.length) model.applyLocalPatch(patch);
    this.switchToViewPanel();
    this.state.surface.rerender();
  };
}
