import {invokeFirstOnly} from '@jsonjoy.com/util/lib/invokeFirstOnly';
import type {PeritextRef, PeritextSelection, RichtextEditorFacade, PeritextOperation} from './types';
import type {FanOutUnsubscribe} from 'thingies/lib/fanout';
import type {ChangeEvent} from 'json-joy/lib/json-crdt/model/api/events';

export class PeritextBinding {
  public static bind = (peritext: PeritextRef, editor: RichtextEditorFacade) => {
    const binding = new PeritextBinding(peritext, editor);
    binding.bind();
    return binding.unbind;
  };

  protected readonly race = invokeFirstOnly();

  constructor(
    protected readonly peritext: PeritextRef,
    protected readonly facade: RichtextEditorFacade,
  ) {}

  // ----------------------------------------------------- Model-to-Editor sync

  protected readonly onModelChange = (event: ChangeEvent) => {
    return this.race(() => {
      this.syncFromModel();
    });
  };

  public syncFromModel(): void {
    const peritext = this.peritext();
    const facade = this.facade;
    const txt = peritext.txt;
    txt.refresh();
    const fragment = txt.blocks;
    facade.set(fragment);
    const selection = this._selection;
    if (selection) facade.setSelection?.(peritext, selection[0], selection[1]);
  }

  // ----------------------------------------------------- Editor-to-Model sync

  private readonly onEditorChange = (operation?: PeritextOperation | void): PeritextRef | void => {
    return this.race(() => {
      return this.syncFromEditor(operation);
    });
  };

  public syncFromEditor(operation: PeritextOperation | void): PeritextRef {
    const peritext = this.peritext;
    const txt = peritext().txt;
    if (operation) {
      const [pos, del, ins] = operation;
      if (del > 0) txt.delAt(pos, del);
      if (ins) txt.insAt(pos, ins);
    } else {
      const viewRange = this.facade.get();
      txt.editor.merge(viewRange);
    }
    txt.refresh();
    return peritext;
  }

  // ------------------------------------------------------------------ Binding

  private _s0: FanOutUnsubscribe | null = null;
  private _s1: FanOutUnsubscribe | null = null;
  private _s2: FanOutUnsubscribe | null = null;

  /** Last known selection before a local change, if any. */
  private _selection: PeritextSelection | undefined = undefined;

  public readonly bind = () => {
    this.syncFromModel();
    const editor = this.facade;
    editor.onchange = this.onEditorChange;
    const peritext = this.peritext();
    this._s0 = peritext.onSubtreeChange(this.onModelChange);

    // Model resets replace the entire node tree. The `onSubtreeChange`
    // listener may miss resets when only deep descendants changed (because
    // only nodes whose NodeApi was accessed are tracked). Subscribe to
    // the model-level `onReset` to guarantee we re-sync the editor.
    this._s2 = peritext.api.onReset.listen(() => {
      this.race(() => {
        this.syncFromModel();
      });
    });

    const facade = this.facade;
    if (facade.getSelection) {
      const storeSelection = () => {
        this._selection = facade.getSelection?.(peritext);
      };
      this._s1 = peritext.api.onBeforeChange.listen(storeSelection);
    }
  };

  public readonly unbind = () => {
    this._s0?.();
    this._s1?.();
    this._s2?.();
    this.facade.dispose?.();
  };
}
