import type {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';

/** A point-in-time snapshot of all user selections in a specific window (processId). */
export type UserPresence<Meta extends object = object> = [
  /** Unique user ID, specific to the platform. */
  userId: string,
  /** Unique process ID, for the view of the user, e.g. each tab or window of
   * the user can have a different process ID. */
  processId: string,
  /** Monotonically increasing sequence number for the user's selections. */
  seq: number,
  /** Timestamp in seconds when this selection entry was constructed on the user's device. */
  ts: number,
  /** Selections made by the user in various JSON CRDT documents, in various UI locations. */
  selections: JsonCrdtSelection[],
  /** Additional app-specific metadata associated with the user's presence
   * (e.g. could hold username, avatar, active page path, etc.). */
  meta: Meta,
];

export type JsonCrdtSelection = RgaSelection | AnySelection | ObjSelection | VecSelection;

export type NodeSelection<Type extends JsonCrdtDataType> = [
  /** Document ID, which is a globally unique identifier for a document. */
  documentId: string,

  /**
   * Location ID within the UI, in case some JSON CRDT is bound to multiple
   * places in the UI. For example, if the same JSON CRDT document is bound to
   * some UI in sidebar and also in the main editor, the location ID can be
   * strings like "sidebar" and "main-editor" to differentiate the two locations.
   */
  uiLocationId: string,

  /** JSON CRDT Model latest logical clock value. */
  ...PresenceId,

  /** An object, of custom metadata associated with the selection. */
  meta: object,

  /**
   * The type of selection. Technically this is redundant as the selection type
   * can be inferred from the resolved node, but it is included in case we want
   * to infer the selection type without resolving the node.
   */
  type: Type,

  /** The ID of the node being selected. */
  nodeId: PresenceIdShorthand,
];

/** Selection within an RGA node, such as a "str", "arr", or "bin" nodes. */
export type RgaSelection = [...NodeSelection<JsonCrdtDataType.str | JsonCrdtDataType.bin | JsonCrdtDataType.arr>, cursors: PresenceCursor[]];

/** Selects a whole JSON CRDT node, any node. */
export type AnySelection = [...NodeSelection<JsonCrdtDataType.con | JsonCrdtDataType.val>];

/** Selects an "obj" node with ability to select a specific node. */
export type ObjSelection = [...NodeSelection<JsonCrdtDataType.obj>, key?: string];

/** Selects a "vec" node with ability to select a specific index. */
export type VecSelection = [...NodeSelection<JsonCrdtDataType.vec>, indexFrom?: number, indexTo?: number];

/**
 * The selection range of a peer. `anchor` is the starting point of the selection,
 * and `focus` is the ending point of the selection. If `focus` is not provided,
 * the selection is a caret (a single point).
 */
export type PresenceCursor = [anchor: PresencePoint, focus?: PresencePoint];

export type PresencePoint = [
  id: PresenceIdShorthand,
  /** Zero means point is anchored to the left of the character, one means right.
   * Useful for "peritext" nodes, for "str" nodes should be omitted. */
  anchor?: 0 | 1,
];

export type PresenceId = [time: number, sid: number];
export type PresenceIdShorthand = [time: number, sid?: number];
