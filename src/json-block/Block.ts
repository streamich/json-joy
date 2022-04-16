import {BehaviorSubject, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

/**
 * A unified interface which various collaborative editing approaches
 * (CRDT with vector clock, CRDT with server clock, OT, client-only OT,
 * simple patch, etc.) need to implement.
 */
export interface BlockModel<Data, Patch> {
  /** Unique ID of this block. */
  // id: string;
  /** Get latest data of this block. */
  getData(): Data;
  /** Create an independent copy of this block. */
  fork(): BlockModel<Data, Patch>;
  /** Apply a single patch of changes. */
  apply(patch: Patch): void;
}

export class BasicBlock<Data, Patch> {
  public version$: BehaviorSubject<number>;

  constructor(version: number, public readonly model: BlockModel<Data, Patch>) {
    this.version$ = new BehaviorSubject<number>(version);
  }

  public fork(): BasicBlock<Data, Patch> {
    return new BasicBlock<Data, Patch>(this.version$.getValue(), this.model.fork());
  }

  /**
   * Observable of the latest data value of this block. It is wrapped in
   * a function to allow for lazy evaluation.
   */
  public data$(): Observable<Data> {
    return this.version$.pipe(switchMap(() => of(this.model.getData())));
  }

  /** Get the latest value of the block. */
  public getData(): Data {
    return this.model.getData();
  }

  public apply(patch: Patch): void {
    this.model.apply(patch);
    this.version$.next(this.version$.getValue() + 1);
  }
}

export type PatchResponse<Patch> = true | false | Patch;

export interface BranchDependencies<Patch> {
  readonly merge: (baseVersion: number, patches: Patch[]) => Promise<BranchMergeResponse<Patch>>;
}

export interface BranchMergeResponse<Patch> {
  version: number;
  batches: PatchResponse<Patch>[][];
}

export class Branch<Data, Patch> {
  /** The last known confirmed value on the server. */
  protected readonly base$: BehaviorSubject<BasicBlock<Data, Patch>>;

  /** Block value including all latest changes optimistically applied on the client. */
  protected readonly head$: BehaviorSubject<BasicBlock<Data, Patch>>;

  /**
   * List of patches applied locally to the head, but not saved
   * on the server. This is delta between the base and the head.
   * */
  protected patches: Patch[];

  /** Number of patches currently being merged to the server. */
  protected merging: number = 0;

  constructor(base: BasicBlock<Data, Patch>) {
    this.base$ = new BehaviorSubject(base);
    this.patches = [];
    this.head$ = new BehaviorSubject(base.fork());
  }

  public async merge(opts: BranchDependencies<Patch>): Promise<void> {
    try {
      const base = this.base$.getValue();
      const baseVersion = base.version$.getValue();
      const batch = [...this.patches];
      this.merging = batch.length;
      const res = await opts.merge(baseVersion, batch);
      
    } catch (error) {
      this.merging = 0;
    }
  }

  /** Apply a patch locally to the head. */
  public commit(patch: Patch): void {
    this.patches.push(patch);
    this.head$.getValue().apply(patch);
  }

  /**
   * Advance the base to the latest known value from the server and
   * re-apply all local patches, after optional transformation.
   */
  public rebase(patches: Patch[]): void {
    const base = this.base$.getValue();
    for (const patch of patches) base.apply(patch);
    const head = base.fork();
    // TODO: apply operation transformations here.
    for (const patch of this.patches) head.apply(patch);
    this.head$.next(head);
  }

  /** Set new base and reset all local changes. Returns local changes. */
  public reset(base: BasicBlock<Data, Patch>): Patch[] {
    this.base$.next(base);
    const patches = this.patches;
    this.patches = [];
    this.head$.next(base.fork());
    return patches;
  }
}
