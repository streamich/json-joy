import type {SliceRegistryEntry} from "../../../../json-crdt-extensions/peritext/registry/SliceRegistryEntry";
import type {ObjApi} from "../../../../json-crdt/model";
import type {ObjNode} from "../../../../json-crdt/nodes";

/**
 * Transient UI configuration state of a slice. Used to render to the user
 * slice configuration UI, such as popups, modals, etc.
 */
export interface SliceConfigState<Node extends ObjNode = ObjNode> {
  /** Slice definition in the registry. */
  def: SliceRegistryEntry;

  /**
   * An object representing the actual configuration of this slice instance.
   * This object is either already stored in the document, or will be stored
   * when the user commits the changes.
   */
  conf(): ObjApi<Node>;
}
