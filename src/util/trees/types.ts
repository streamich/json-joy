export interface ITreeNode<K = unknown, V = unknown> {
  /** Parent. */
  p: ITreeNode<K, V> | undefined;
  /** Left. */
  l: ITreeNode<K, V> | undefined;
  /** Right. */
  r: ITreeNode<K, V> | undefined;
  /** Node key. */
  k: K;
  /** Node value. */
  v: V;
}

export interface HeadlessNode {
  p: HeadlessNode | undefined;
  l: HeadlessNode | undefined;
  r: HeadlessNode | undefined;
}

export type Comparator<T> = (a: T, b: T) => number;
