export type FieldName = `${string}_${string}`;

export interface IndexedNodeFields {
  /* Root node */
  r?: Uint8Array;
  /* Nodes */
  [key: FieldName]: Uint8Array;
}

export interface IndexedFields extends IndexedNodeFields {
  /* Clock table */
  c: Uint8Array;
}
