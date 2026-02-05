import {Patch, InsValOp, InsObjOp, InsVecOp, InsStrOp, InsBinOp, InsArrOp, UpdArrOp, DelOp} from "../../../json-crdt-patch";
import type {JsonNode} from '../../nodes';
import type {ModelApi} from "./nodes";

export const enum ChangeEventOrigin {
  Local = 0,
  Remote = 1,
  Reset = 2,
}

export type RawEventData =
  /** Emitted by RESET event (no data). */
  | undefined
  /** Emitted by LOCAL event, the starting index in the un-flushed patch. */
  | number
  /** Emitted by `.applyPatch(patch: Patch)`. */
  | Patch;

/** Operation targets specific node: the operation has `.obj` property. */
const operationTargetsNode = (op: unknown): op is (InsValOp | InsObjOp | InsVecOp | InsStrOp | InsBinOp | InsArrOp | UpdArrOp | DelOp) => {
  return op instanceof InsValOp ||
    op instanceof InsObjOp ||
    op instanceof InsVecOp ||
    op instanceof InsStrOp ||
    op instanceof InsBinOp ||
    op instanceof InsArrOp ||
    op instanceof UpdArrOp ||
    op instanceof DelOp;
};

export class ChangeEvent {
  constructor(
    public readonly raw: RawEventData,
    public readonly api: ModelApi<any>,
  ) {}

  public origin(): ChangeEventOrigin {
    const {raw, api} = this;
    return raw === undefined
      ? ChangeEventOrigin.Reset
      : typeof raw === 'number'
        ? ChangeEventOrigin.Local
        : raw instanceof Patch
          ? raw.getId()?.sid === api.model.clock.sid
            ? ChangeEventOrigin.Local
            : ChangeEventOrigin.Remote
          : ChangeEventOrigin.Local;
  }

  public isLocal(): boolean {
    return this.origin() === ChangeEventOrigin.Local;
  }

  public isReset(): boolean {
    return this.raw === undefined;
  }

  private _direct: Set<JsonNode> | null = null;

  /**
   * JSON CRDT nodes directly affected by this change event, i.e. nodes
   * which are direct targets of operations in the change.
   */
  public direct(): Set<JsonNode> {
    let direct = this._direct;
    if (!direct) {
      this._direct = direct = new Set<JsonNode>();
      const raw = this.raw;
      const index = this.api.model.index;
      if (typeof raw === 'number') {
        const startIndex = raw;
        const api = this.api;
        const ops = api.builder.patch.ops;
        for (let i = startIndex; i < ops.length; i++) {
          const op = ops[i];
          if (operationTargetsNode(op)) {
            const node = index.get(op.obj);
            if (node) direct.add(node);
          }
        }
      } else if (raw instanceof Patch) {
        const ops = raw.ops;
        const length = ops.length;
        for (let i = 0; i < length; i++) {
          const op = ops[i];
          if (operationTargetsNode(op)) {
            const node = index.get(op.obj);
            if (node) direct.add(node);
          }
        }
      }
    }
    return direct;
  }

  private _parents: Set<JsonNode> | null = null;

  /**
   * JSON CRDT nodes which are parents of directly affected nodes in this
   * change event.
   */
  public parents(): Set<JsonNode> {
    let parents = this._parents;
    if (!parents) {
      this._parents = parents = new Set<JsonNode>();
      const direct = this.direct();
      for (const start of direct) {
        let parent = start.parent;
        while (parent && !parents.has(parent)) {
          parents.add(parent);
          parent = parent.parent;
        }
      }
    }
    return parents;
  }
}
