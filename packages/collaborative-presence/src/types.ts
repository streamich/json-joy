import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants'

/** Ephemeral data that is broadcasted about other peers in the editor. */
export type PeerData = [
  /** Unique user ID, specific to the platform. */
  peerId: string,
  /** Selections made by the peer in various JSON CRDT documents, in various UI locations. */
  selections: JsonCrdtSelection[],
  /** Timestamp in seconds when this selection entry was constructed. */
  ts?: number,
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

  /** An object, of custom metadata associated with the selection. */
  meta: object,

  /**
   * The type of selection. Technically this is redundant as the selection type
   * can be inferred from the resolved node, but it is included in case we want
   * to infer the selection type without resolving the node.
   */
  type: Type,

  /** The ID of the node being selected. */
  nodeId: JsonCrdtId,
];

/** Selection within an RGA node, such as a "str", "arr", or "bin" nodes. */
export type RgaSelection = [...NodeSelection<JsonCrdtDataType.str | JsonCrdtDataType.bin | JsonCrdtDataType.arr>, ...JsonCrdtCursor];

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
export type JsonCrdtCursor = [anchor: JsonCrdtRgaPoint, focus?: JsonCrdtRgaPoint];

export type JsonCrdtRgaPoint = [
  id: JsonCrdtIdShorthand,
  /** Zero means point is anchored to the left of the character, one means right. */
  anchor?: 0 | 1,
];

export type JsonCrdtId = [time: number, sid: number];
export type JsonCrdtIdShorthand = [time: number, sid?: number];
