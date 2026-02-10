import {invokeFirstOnly} from '@jsonjoy.com/util/lib/invokeFirstOnly';
import type {PeritextRef, RichtextEditorFacade, SimpleChange} from './types';
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
    console.log('syncFromModel');
    const peritext = this.peritext;
    const txt = peritext().txt;
    txt.refresh();
    const fragment = txt.blocks;
    // TODO: handle selection here
    this.facade.set(fragment);
  }

  // ----------------------------------------------------- Editor-to-Model sync

  private readonly onEditorChange = (changes: SimpleChange[] | void, verify?: boolean): (PeritextRef | void) => {
    return this.race(() => {
      return this.syncFromEditor();
    });
  };

  public syncFromEditor(): PeritextRef {
    console.log('syncFromEditor');
    const viewRange = this.facade.get();
    const peritext = this.peritext;
    const txt = peritext().txt;
    txt.editor.merge(viewRange);
    txt.refresh();
    return peritext;
  }

  // ------------------------------------------------------------------ Binding

  private _s: FanOutUnsubscribe | null = null;

  public readonly bind = () => {
    this.syncFromModel();
    const editor = this.facade;
    editor.onchange = this.onEditorChange;
    // editor.onselection = () => this.saveSelection();
    this._s = this.peritext().onSubtreeChange(this.onModelChange);
  };

  public readonly unbind = () => {
    this._s?.();
    this.facade.dispose?.();
  };
}
