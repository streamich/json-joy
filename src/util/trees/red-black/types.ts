export interface IRbTreeNode<K = unknown, V = unknown> {
  /** Parent. */
  p: IRbTreeNode<K, V> | undefined;
  /** Left. */
  l: IRbTreeNode<K, V> | undefined;
  /** Right. */
  r: IRbTreeNode<K, V> | undefined;
  /** Node key. */
  k: K;
  /** Node value. */
  v: V;
  /** Whether the node is "black". */
  b: boolean;
}

export interface RbHeadlessNode {
  p: RbHeadlessNode | undefined;
  l: RbHeadlessNode | undefined;
  r: RbHeadlessNode | undefined;
  /** Whether the node is "black". */
  b: boolean;
}

export interface RbNodeReference<N extends IRbTreeNode> {
  /**
   * Immutable read-only key of the node.
   */
  readonly k: N['k'];

  /**
   * Mutable value of the node. The fastest way to update mutate tree nodes
   * is to get hold of ${@link RbNodeReference} and update this value directly.
   */
  v: N['v'];
}
