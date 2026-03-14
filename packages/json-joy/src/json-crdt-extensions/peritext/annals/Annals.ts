import {WebUndo} from './WebUndo';
import {MemoryUndo} from './MemoryUndo';
import {printTree, type Printable} from 'tree-dump';
import type {Patch} from '../../../json-crdt-patch';
import type {Peritext} from '../../../json-crdt-extensions';
import type {RedoCallback, RedoItem, UndoCallback, UndoItem} from './types';
import type {UiLifeCycles} from '../types';
import type {Log} from '../../../json-crdt/log/Log';
import type {UndoCollector} from '../../../json-crdt-extensions/peritext/events/defaults/types';
import type {PeritextEventTarget} from '../../../json-crdt-extensions/peritext/events/PeritextEventTarget';

export class Annals implements UndoCollector, UiLifeCycles, Printable {
  protected manager = typeof document === 'undefined' ? new MemoryUndo() : new WebUndo();

  constructor(
    public readonly log: Log,
    public readonly txt: Peritext,
    public readonly et: PeritextEventTarget,
  ) {}

  protected captured = new WeakSet<Patch>();

  /** ------------------------------------------------- {@link UndoCollector} */

  public capture(): void {
    const currentPatch = this.txt.model.api.builder.patch;
    this.captured.add(currentPatch);
  }

  public undo(): void {
    this.manager.undo();
  }

  public redo(): void {
    this.manager.redo();
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const stopManager = this.manager.start();
    const {captured, txt} = this;
    txt.model.api.onFlush.listen((patch) => {
      const isCaptured = captured.has(patch);
      if (isCaptured) {
        captured.delete(patch);
        const item: UndoItem<Patch, Patch> = [patch, this._undo];
        this.manager.push(item);
      }
    });
    return () => {
      stopManager();
    };
  }

  public readonly _undo: UndoCallback<Patch, Patch> = (doPatch: Patch) => {
    const {log, et} = this;
    const patch = log.undo(doPatch);
    et.dispatch('annals', {
      action: 'undo',
      batch: [patch],
    });
    // console.log('doPatch', doPatch + '');
    // console.log('undoPatch', patch + '');
    return [doPatch, this._redo] as RedoItem<Patch, Patch>;
  };

  public readonly _redo: RedoCallback<Patch, Patch> = (doPatch: Patch) => {
    const {log, et} = this;
    const redoPatch = doPatch.rebase(log.end.clock.time);
    et.dispatch('annals', {
      action: 'redo',
      batch: [redoPatch],
    });
    // console.log('doPatch', doPatch + '');
    // console.log('redoPatch', redoPatch + '');
    return [redoPatch, this._undo] as RedoItem<Patch, Patch>;
  };

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab?: string): string {
    return (
      'Annals' +
      printTree(tab, [(tab) => 'undo: ' + this.manager.uStack.length, (tab) => 'redo: ' + this.manager.rStack.length])
    );
  }
}
