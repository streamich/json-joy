export interface FuzzerOptions {
  /** JSON value which to set as root at the very beginning. */
  startingValue: unknown | undefined;

  /** Probability that delete operation is selected. */
  stringDeleteProbability: number;

  /** Probability that delete operation is selected. */
  binaryDeleteProbability: number;

  /** Maximum length of substring to delete. */
  maxStringDeleteLength: number;

  /** Maximum size of string contents in a string node. */
  maxStringLength: number;

  /** Maximum size of Uint8Array contents in a binary node. */
  maxBinaryLength: number;

  /** Maximum substring length that is inserted in a string node. */
  maxSubstringLength: number;

  /** Maximum size of binary data to insert in binary type. */
  maxBinaryChunkLength: number;

  /** Maximum number of peers that concurrently should edit the document. */
  maxConcurrentPeers: number;

  /** Maximum number of patches each concurrent peer is allowed to generate. */
  maxPatchesPerPeer: number;
}
