import {invokeFirstOnly} from '@jsonjoy.com/util/lib/invokeFirstOnly';
import {applyChange} from './util';
import {diff, diffEdit} from 'json-joy/lib/util/diff/str';
import {Peritext} from 'json-joy/lib/json-crdt-extensions/peritext/Peritext';
import type {CollaborativeStr, RichtextEditorFacade, SimpleChange} from './types';

const enum PATCH_OP_TYPE {
  DEL = -1,
  EQL = 0,
  INS = 1,
}

export class PeritextBinding {
  public static bind = (txt: () => Peritext, editor: RichtextEditorFacade, polling?: boolean) => {
    const binding = new PeritextBinding(txt, editor);
    binding.syncFromModel();
    binding.bind(polling);
    return binding.unbind;
  };

  protected readonly race = invokeFirstOnly();

  /**
   * Latest cached model view.
   * @readonly
   */
  public view: string;

  constructor(
    protected readonly txt: () => Peritext,
    protected readonly editor: RichtextEditorFacade,
  ) {
    this.view = txt().view()
  }

  // ---------------------------------------------------------------- Selection

  protected saveSelection() {
    throw new Error('Not implemented yet.');
    // const {editor, selection} = this;
    // const str = this.txt();
    // if (!str) return;
    // const [selectionStart, selectionEnd, selectionDirection] = editor.getSelection?.() || [-1, -1, 0];
    // const {start, end} = selection;
    // const now = Date.now();
    // const tick = str.api.model.tick;
    // // Return early to avoid excessive RGA queries.
    // if (start === selectionStart && end === selectionEnd && (tick === selection.tick || now - selection.ts < 3000))
    //   return;
    // selection.start = selectionStart;
    // selection.end = selectionEnd;
    // selection.dir = selectionDirection;
    // selection.ts = now;
    // selection.tick = tick;
    // selection.startId = typeof selectionStart === 'number' ? (str.findId((selectionStart ?? 0) - 1) ?? null) : null;
    // selection.endId = typeof selectionEnd === 'number' ? (str.findId((selectionEnd ?? 0) - 1) ?? null) : null;
  }

  // ----------------------------------------------------- Model-to-Editor sync

  public syncFromModel() {
    throw new Error('Not implemented yet.');
    // const editor = this.editor;
    // const str = this.txt();
    // if (!str) return;
    // const view = ((this.view = str.view()) as string | undefined) || '';
    // if (editor.ins && editor.del) {
    //   const editorText = editor.get();
    //   if (view === editorText) return;
    //   // TODO: PERF: Construct `changes` from JSON CRDT Patches.
    //   const changes = diff(editorText, view);
    //   const changeLen = changes.length;
    //   let pos: number = 0;
    //   for (let i = 0; i < changeLen; i++) {
    //     const change = changes[i];
    //     const [type, text] = change;
    //     const len = text.length;
    //     switch (type as unknown as PATCH_OP_TYPE) {
    //       case PATCH_OP_TYPE.DEL:
    //         editor.del(pos, len);
    //         break;
    //       case PATCH_OP_TYPE.EQL:
    //         pos += len;
    //         break;
    //       case PATCH_OP_TYPE.INS:
    //         editor.ins(pos, text);
    //         pos += len;
    //         break;
    //     }
    //   }
    // } else {
    //   editor.set(view);
    //   const {selection} = this;
    //   if (editor.setSelection) {
    //     const start = selection.startId ? str.findPos(selection.startId) + 1 : -1;
    //     const end = selection.endId ? str.findPos(selection.endId) + 1 : -1;
    //     editor.setSelection(start, end, selection.dir);
    //   }
    // }
  }

  protected readonly onModelChange = () => {
    this.race(() => {
      this.syncFromModel();
      // this.saveSelection();
    });
  };

  // ----------------------------------------------------- Editor-to-Model sync

  public syncFromEditor() {
    throw new Error('Not implemented yet.');
    // let view = this.view;
    // const value = this.editor.get();
    // if (value === view) return;
    // const selection = this.selection;
    // const caretPos: number | undefined = selection.start === selection.end ? (selection.start ?? undefined) : undefined;
    // const changes = diffEdit(view, value, caretPos || 0);
    // const changeLen = changes.length;
    // const str = this.txt();
    // if (!str) return;
    // str.api.transaction(() => {
    //   let pos: number = 0;
    //   for (let i = 0; i < changeLen; i++) {
    //     const change = changes[i];
    //     const [type, text] = change;
    //     switch (type as unknown as PATCH_OP_TYPE) {
    //       case PATCH_OP_TYPE.DEL: {
    //         view = applyChange(view, pos, text.length, '');
    //         str.del(pos, text.length);
    //         break;
    //       }
    //       case PATCH_OP_TYPE.EQL: {
    //         pos += text.length;
    //         break;
    //       }
    //       case PATCH_OP_TYPE.INS: {
    //         view = applyChange(view, pos, 0, text);
    //         str.ins(pos, text);
    //         pos += text.length;
    //         break;
    //       }
    //     }
    //   }
    // });
    // this.view = view;
    // this.saveSelection();
  }

  private readonly onchange = (changes: SimpleChange[] | void, verify?: boolean) => {
    throw new Error('Not implemented yet.');
    // this.race(() => {
    //   // console.time('onchange');
    //   if (changes instanceof Array && changes.length > 0) {
    //     const str = this.txt();
    //     if (!str) return;
    //     let applyChanges = true;
    //     if (verify) {
    //       let view = this.view;
    //       for (let i = 0; i < length; i++) {
    //         const change = changes[i];
    //         const [position, remove, insert] = change;
    //         view = applyChange(view, position, remove, insert);
    //       }
    //       const editor = this.editor;
    //       if ((editor.getLength && view.length !== editor.getLength()) || view !== editor.get()) applyChanges = false;
    //       else this.view = view;
    //     }
    //     if (applyChanges) {
    //       const length = changes.length;
    //       try {
    //         str.api.transaction(() => {
    //           let view = this.view;
    //           for (let i = 0; i < length; i++) {
    //             const change = changes[i];
    //             const [position, remove, insert] = change;
    //             view = applyChange(view, position, remove, insert);
    //             if (remove) str.del(position, remove);
    //             if (insert) str.ins(position, insert);
    //           }
    //           this.view = view;
    //         });
    //         this.saveSelection();
    //         // console.timeEnd('onchange');
    //         return;
    //       } catch {}
    //     }
    //   }
    //   this.syncFromEditor();
    //   // console.timeEnd('onchange');
    // });
  };

  // ------------------------------------------------------------------ Polling

  public pollingInterval: number = 1000;
  private _p: number | null | unknown = null;

  private readonly pollChanges = () => {
    this._p = setTimeout(() => {
      this.race(() => {
        try {
          const view = this.view;
          const editor = this.editor;
          const needsSync = view !== editor.get();
          if (needsSync) this.syncFromEditor();
        } catch {}
        if (this._p) this.pollChanges();
      });
    }, this.pollingInterval);
  };

  public stopPolling() {
    if (this._p) clearTimeout(this._p as any);
    this._p = null;
  }

  // ------------------------------------------------------------------ Binding

  private _s: (() => void) | null = null;

  public readonly bind = (polling?: boolean) => {
    this.syncFromModel();
    const editor = this.editor;
    editor.onchange = this.onchange;
    editor.onselection = () => this.saveSelection();
    if (polling) this.pollChanges();
    this._s = this.txt().api.onChange.listen(this.onModelChange);
  };

  public readonly unbind = () => {
    this.stopPolling();
    this._s?.();
    this.editor.dispose?.();
  };
}
