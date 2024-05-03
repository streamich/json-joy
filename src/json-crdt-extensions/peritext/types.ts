import type {SchemaToJsonNode} from '../../json-crdt/schema/types';
import type {SCHEMA} from './constants';

/**
 * Represents an object which state can change over time.
 *
 * @todo Move to /src/utils.
 */
export interface Stateful {
  /**
   * Hash of the current state. Updated by calling `refresh()`.
   */
  hash: number;

  /**
   * Recomputes object's hash.
   * @returns The new hash.
   */
  refresh(): number;
}

export type PeritextDataNodeSchema = ReturnType<typeof SCHEMA>;
export type PeritextDataNode = SchemaToJsonNode<PeritextDataNodeSchema>;
