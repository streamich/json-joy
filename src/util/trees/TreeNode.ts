import {ITreeNode} from './types';

export class TreeNode<K = unknown, V = unknown> implements ITreeNode<K, V> {
  public p: ITreeNode<K, V> | undefined = undefined;
  public l: ITreeNode<K, V> | undefined = undefined;
  public r: ITreeNode<K, V> | undefined = undefined;

  constructor(
    public k: K,
    public v: V,
  ) {}
}
