/**
 * - Positive number specifies how many chars to retain.
 * - Negative number specifies how many chars to remove.
 * - String in an array specifies a substring deletion.
 * - String is a substring insertion.
 */
export type StringOpComponent = number | [string] | string;

/**
 * This form of operation encoding results in most efficient
 * binary encoding using MessagePack.
 *
 * Consider operation:
 *
 * ```
 * [5, "hello", -4]
 * ```
 *
 * - Array is encoded as one byte fixarr.
 * - 5 is encoded as one byte fixint.
 * - String header is encoded as one byte fixstr followed by 5 bytes of UTF-8 string.
 * - -4 is encoded as one byte fixint.
 */
export type StringOp = StringOpComponent[];
