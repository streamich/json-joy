import type {ITimestampStruct} from './clock';

/**
 * Something in the document that can be identified by ID. All operations have
 * IDs and operations result into JSON nodes and chunks, which also have IDs.
 *
 * @todo Move it to `types.ts` file.
 */
export interface Identifiable {
  /**
   * Unique ID within a document.
   */
  id: ITimestampStruct;

  /**
   * Sometimes an Identifiable can be a compound entity, which holds multiple
   * entries with sequentially growing timestamps. In this case `span` represents
   * the number of entries.
   */
  span?(): number;

  /**
   * Used for debugging.
   */
  toString(tab?: string): string;
}
