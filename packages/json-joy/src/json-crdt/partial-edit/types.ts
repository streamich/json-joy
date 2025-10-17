import type {IndexedFields, FieldName} from '../codec/indexed/binary/types';

/**
 * A set of changes that will need to be applied to a document.
 */
export interface FieldEdits {
  /** New or existing fields to write. */
  updates: IndexedFields;
  /** Fields to delete. */
  deletes: Set<FieldName>;
}
