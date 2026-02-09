import {invokeFirstOnly} from '@jsonjoy.com/util/lib/invokeFirstOnly';
// import {applyChange} from './util';
// import {diff, diffEdit} from 'json-joy/lib/util/diff/str';
import {PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import {deepEqual} from '@jsonjoy.com/json-equal';
import type {RichtextEditorFacade, SimpleChange} from './types';

// const enum PATCH_OP_TYPE {
//   DEL = -1,
//   EQL = 0,
//   INS = 1,
// }

export class PeritextBinding {
  public static bind = (peritext: () => PeritextApi, editor: RichtextEditorFacade, polling?: boolean) => {
    const binding = new PeritextBinding(peritext, editor);
    binding.bind(polling);
    return binding.unbind;
  };

  protected readonly race = invokeFirstOnly();

  constructor(
    protected readonly peritext: () => PeritextApi,
    protected readonly facade: RichtextEditorFacade,
  ) {}

  // ---------------------------------------------------------------- Selection

  protected saveSelection() {
  }

  // ----------------------------------------------------- Model-to-Editor sync

  public syncFromModel() {
    console.log('syncFromModel');
    const txt = this.peritext().txt;
    txt.refresh();
    const fragment = txt.blocks;
    // console.log(fragment + '');
    this.facade.set(fragment);
  }

  protected readonly onModelChange = () => {
    this.race(() => {
      this.syncFromModel();
      // this.saveSelection();
    });
  };

  // ----------------------------------------------------- Editor-to-Model sync

  /**
   * @todo 1. Check if view needs to be synced, or make diff high performance.
   * @todo 2. Save selection, if needed.
   * @todo 3. Optimize to use granular insert/delete if available.
   * @todo 4. Optimize to use granular inline formatting if available.
   */
  public syncFromEditor() {
    console.log('syncFromEditor');
    const viewRange = this.facade.get();
    // if (value === view || deepEqual(view, value)) return;
    // if (value === view) return;
    const peritext = this.peritext();
    if (!peritext) return;
    // const selection = this.selection;
    // const caretPos: number | undefined = selection.start === selection.end ? (selection.start ?? undefined) : undefined;
    const txt = peritext.txt;
    console.log('viewRange', viewRange);
    txt.editor.merge(viewRange);
    txt.refresh();
  }

  private readonly onchange = (changes: SimpleChange[] | void, verify?: boolean) => {
    this.race(() => {
      console.log('onchange (editor → model)');
      this.syncFromEditor();
    });
  };

  // ------------------------------------------------------------------ Polling

  public pollingInterval: number = 1000;
  private _p: number | null | unknown = null;

  private readonly pollChanges = () => {
    throw new Error('Not implemented yet.');
    // this._p = setTimeout(() => {
    //   this.race(() => {
    //     try {
    //       const view = this.view;
    //       const editor = this.editor;
    //       const needsSync = view !== editor.get();
    //       if (needsSync) this.syncFromEditor();
    //     } catch {}
    //     if (this._p) this.pollChanges();
    //   });
    // }, this.pollingInterval);
  };

  public stopPolling() {
    if (this._p) clearTimeout(this._p as any);
    this._p = null;
  }

  // ------------------------------------------------------------------ Binding

  private _s: (() => void) | null = null;

  public readonly bind = (polling?: boolean) => {
    this.syncFromModel();
    const editor = this.facade;
    editor.onchange = this.onchange;
    editor.onselection = () => this.saveSelection();
    if (polling) this.pollChanges();
    this._s = this.peritext().onSubtreeChange(this.onModelChange);
  };

  public readonly unbind = () => {
    this.stopPolling();
    this._s?.();
    this.facade.dispose?.();
  };
}
