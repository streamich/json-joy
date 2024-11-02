import type {Patch} from '../../json-crdt-patch';
import type {Model} from '../model';

/**
 * Terminology:
 *
 * - `remote`: the state of the document that is known to the remote server/peers.
 * - `base`: the next state of the document which is in the process of being saved to the remote server.
 * - `head`: the current state of the document which is being edited by the user.
 * - `tip`: the future state of the document, ahead of `head`, could be due to undo/redo.
 *
 * The `log` starts at `remote` and ends at `tip`, the `base` and `head` pointers
 * are in the middle of the `log`.
 */
export interface DraftOptions {
  base: Model;
  head: Patch[];
  tip: Patch[];
}

export class Draft {
  base: Model;
  head: Model;
  tip: Patch[];

  public constructor(opts: DraftOptions) {
    const base = (this.base = opts.base);
    const head = (this.head = base.clone());
    this.tip = opts.tip;
    for (const patch of opts.head) head.applyPatch(patch);
  }

  /**
   *
   * @param patches
   */
  public rebase(patches: Patch[]): void {
    this.base.applyBatch(patches);
    this.head.applyBatch(patches);
  }

  public advance(index: number): void {}

  public undo(): void {}

  public redo(): void {}
}
