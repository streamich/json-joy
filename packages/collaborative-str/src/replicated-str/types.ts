import type {ITimestampStruct} from 'json-joy/lib/json-crdt';

export interface ReplicatedStrFacade {
  /** Retrieve string value. */
  view: () => string;

  /** Insert text into string. */
  ins: (pos: number, text: string) => void;

  /** Remove text in string. */
  del: (pos: number, length: number) => void;

  /** Change listener. `callback` is called on every change. Returns `unsubscribe` method. */
  subscribe: (callback: () => void) => () => void;

  /**
   * Given a character index in local coordinates, find the ID of the character
   * in the global coordinates.
   *
   * @param index Index of the character or `-1` for before the first character.
   * @returns ID of the character after which the given position is located.
   */
  findId?: (pos: number | -1) => ITimestampStruct;

  /**
   * Given a position in global coordinates, find the position in local
   * coordinates.
   *
   * @param id ID of the character.
   * @returns Index of the character in local coordinates. Returns -1 if the
   *          the position refers to the beginning of the string.
   */
  findPos?: (id: ITimestampStruct) => number | -1;

  /** Wrapper for grouping operations into one patch. */
  transaction?: (callback: () => void) => void;

  /** Counter, which increments on every model change. */
  tick?: () => number;
}
