/**
 * - Positive number specifies how many octets to retain.
 * - Negative number specifies how many octets to remove.
 * - {@link Uint8Array} blob specifies binary data to insert.
 */
export type BinaryOpComponent = number | Uint8Array;

export type BinaryOp = BinaryOpComponent[];
