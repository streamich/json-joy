import {Peritext} from '../../../json-crdt-extensions';
import {WebUndo} from './WebUndo';
import type {Printable} from 'tree-dump';
import type {UiLifeCycles} from '../types';
import type {Patch} from '../../../json-crdt-patch';
import type {RedoCallback, RedoItem, UndoCallback, UndoCollector, UndoItem} from '../../types';
import type {Log} from '../../../json-crdt/log/Log';
import type {PeritextEventTarget} from '../../events/PeritextEventTarget';

export interface UndoRedoControllerOpts {
  log: Log;
  txt: Peritext;
  et: PeritextEventTarget;
}

export class UndoRedoController implements UndoCollector, UiLifeCycles, Printable {
  protected undo = new WebUndo();

  constructor (
    public readonly opts: UndoRedoControllerOpts,
  ) {}

  protected captured = new WeakSet<Patch>();

  /** ------------------------------------------------- {@link UndoCollector} */

  public capture(): void {
    const currentPatch = this.opts.txt.model.api.builder.patch;
    this.captured.add(currentPatch);
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start(): void {
    this.undo.start();
    const {opts, captured} = this;
    const {txt} = opts;
    txt.model.api.onFlush.listen((patch) => {
      const isCaptured = captured.has(patch);
      if (isCaptured) {
        captured.delete(patch);
        const item: UndoItem<Patch, Patch> = [patch, this._undo];
        this.undo.push(item);
      }
    });
  }

  public stop(): void {
    this.undo.stop();
  }

  public readonly _undo: UndoCallback<Patch, Patch> = (source: Patch) => {
    const {log} = this.opts;
    const patch = log.undo(source);
    this.opts.et.dispatch('annals', {
      action: 'undo',
      source,
      patch,
    });
    // log.end.applyPatch(undoPatch);
    console.log('doPatch', source + '');
    console.log('undoPatch', patch + '');
    return [patch, this._redo] as RedoItem<Patch, Patch>;
  };

  public readonly _redo: RedoCallback<Patch, Patch> = (state: Patch) => {
    return [state, this._undo] as RedoItem<Patch, Patch>;
  };

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    throw new Error('Method not implemented.');
  }
}
