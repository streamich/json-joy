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
  public v$: BehaviorSubject<number>;

  constructor(version: number, public readonly model: BlockModel<Data, Patch>) {
    this.v$ = new BehaviorSubject<number>(version);
  }

  public fork(): BasicBlock<Data, Patch> {
    return new BasicBlock<Data, Patch>(this.v$.getValue(), this.model.fork());
  }

  /**
   * Observable of the latest data value of this block. It is wrapped in
   * a function to allow for lazy evaluation.
   */
  public data$(): Observable<Data> {
    return this.v$.pipe(switchMap(() => of(this.model.getData())));
  }

  /** Get the latest value of the block. */
  public getData(): Data {
    return this.model.getData();
  }

  public apply(patch: Patch): void {
    this.model.apply(patch);
    this.v$.next(this.v$.getValue());
  }
}

export type PatchResponse<Patch> = true | false | Patch;

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
   * List of patches applied locally to the head, but not yet
   * added to the `batches` list.
   */
  protected patches: Patch[];

  /** List of batches to be persisted on the server. */
  protected batches: Patch[][] = [];

  constructor(base: BasicBlock<Data, Patch>) {
    this.base$ = new BehaviorSubject(base);
    this.patches = [];
    this.head$ = new BehaviorSubject(base.fork());
  }

  public cutBatch(): void {
    this.batches.push(this.patches);
    this.patches = [];
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
