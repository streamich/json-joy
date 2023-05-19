import type {ITreeNode} from '../types';

export interface IAvlTreeNode<K = unknown, V = unknown> {
  /** Parent. */
  p: IAvlTreeNode<K, V> | undefined;
  /** Left. */
  l: IAvlTreeNode<K, V> | undefined;
  /** Right. */
  r: IAvlTreeNode<K, V> | undefined;
  /** Node key. */
  k: K;
  /** Node value. */
  v: V;
  /** Balance factor. */
  bf: number;
}

export interface AvlHeadlessNode {
  p: AvlHeadlessNode | undefined;
  l: AvlHeadlessNode | undefined;
  r: AvlHeadlessNode | undefined;
  /** Balance factor. */
  bf: number;
}

export interface AvlNodeReference<N extends Pick<ITreeNode, 'k' | 'v'>> {
  /**
   * Immutable read-only key of the node.
   */
  readonly k: N['k'];

  /**
   * Mutable value of the node. The fastest way to update mutate tree nodes
   * is to get hold of ${@link AvlNodeReference} and update this value directly.
   */
  v: N['v'];
}
