import {Patch} from "@automerge/automerge";
import {AvlMap} from "../util/trees/avl/AvlMap";

export class PatchLog {
  /**
   * Patch index by [sid, time].
   */
  private index = new AvlMap<number, AvlMap<number, Patch>>();

  public push(patch: Patch) {}

}
