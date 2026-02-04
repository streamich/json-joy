import {type ITimestampStruct, Patch} from "../../../json-crdt-patch";
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

  private _ids: Set<ITimestampStruct> | null = null;

  /** IDs of JSON CRDT nodes directly affected by this change event. */
  public ids(): Set<ITimestampStruct> {
    let ids = this._ids;
    if (!ids) {
      ids = this._ids = new Set<ITimestampStruct>();
      // ...
    }
    return ids;
  }
}
