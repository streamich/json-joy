import Delta from 'quill-delta';
import {invokeFirstOnly} from './util';
import type Quill from 'quill';
import type {QuillDeltaApi} from 'json-joy/lib/json-crdt-extensions/quill-delta';
import type {QuillDeltaOp} from 'json-joy/lib/json-crdt-extensions/quill-delta/types';
import type {OnTextChange} from './types';

export class QuillBinding {
  public static bind = (api: () => QuillDeltaApi | undefined, quill: Quill) => {
    const binding = new QuillBinding(api, quill);
    binding.bind();
    return binding.unbind;
  };

  protected readonly race = invokeFirstOnly();

  constructor(
    public readonly api: () => QuillDeltaApi | undefined,
    public readonly quill: Quill,
  ) {}

  // ----------------------------------------------------- Editor-to-Model sync

  private readonly onTextChange: OnTextChange = (delta) => {
    this.race(() => {
      const ops = delta.ops as QuillDeltaOp[];
      /**
       * When inside an annotated text (say bold text), a character is inserted,
       * just before the last annotated character, and the inserted character
       * is the same as the last character, then Quill does not insert it in
       * the right place: it inserts it just after the last annotated character.
       * This is a workaround for this bug.
       */
      if (ops.length === 2) {
        const retain: number | undefined = (ops[0] as any).retain;
        const insert: unknown = (ops[1] as any).insert;
        const attributes = (ops[1] as any).attributes;
        if (
          typeof retain === 'number' &&
          typeof insert === 'string' &&
          attributes &&
          insert.length === 1 &&
          insert !== '\n'
        ) {
          const selection = this.quill.getSelection();
          if (selection && selection.length === 0) {
            if (selection.index === retain) {
              delta.ops[0].retain = retain - 1;
            }
          }
        }
      }
      this.api()?.apply(ops);
    });
  };

  // ----------------------------------------------------- Model-to-Editor sync

  protected syncFromModel(): void {
    const api = this.api();
    if (!api) return;
    const modelDelta = new Delta(api.view());
    const editorDelta = this.quill.getContents();
    const diff = editorDelta.diff(modelDelta);
    this.quill.updateContents(diff, 'silent');
  }

  protected readonly onModelChange = () => {
    this.race(() => {
      this.syncFromModel();
    });
  };

  // ------------------------------------------------------------------ Binding

  private _s: (() => void) | null = null;

  public readonly bind = () => {
    const api = this.api();
    if (!api) return;
    const delta = new Delta(api.view());
    const quill = this.quill;
    quill.setContents(delta, 'silent');
    quill.on('text-change', this.onTextChange);
    this._s = api.api.onChange.listen(this.onModelChange);
  };

  public readonly unbind = () => {
    const quill = this.quill;
    quill.off('text-change', this.onTextChange);
    this._s?.();
  };
}
