import {find, findOrNextLower, first, insert, last, next, remove} from './util';
import {splay} from './splay/util';
import {TreeNode} from './TreeNode';
import type {Comparator, ITreeNode} from './types';

const defaultComparator: Comparator<number> = (a, b) => a - b;

export class Tree<K = unknown, V = unknown> {
  public root: ITreeNode<K, V> | undefined = undefined;
  public size: number = 0;

  constructor(public readonly comparator: Comparator<K> = defaultComparator as any) {}

  public set(key: K, value: V): void {
    const node = new TreeNode(key, value);
    this.root = insert(this.root, node, this.comparator);
    this.root = splay(this.root, node, 15);
    this.size++;
  }

  /**
   * Same as `set` but does not splay the tree.
   */
  public setFast(key: K, value: V): void {
    const node = new TreeNode(key, value);
    this.root = insert(this.root, node, this.comparator);
    this.size++;
  }

  public get(key: K): V | undefined {
    const node = find(this.root, key, this.comparator);
    return node ? node.v : undefined;
  }

  public getOrNextLower(key: K): V | undefined {
    const node = findOrNextLower(this.root, key, this.comparator);
    return node ? node.v : undefined;
  }

  public has(key: K): boolean {
    return !!find(this.root, key, this.comparator);
  }

  public delete(key: K): V | undefined {
    const node = find(this.root, key, this.comparator);
    if (!node) return undefined;
    this.root = remove(this.root, node);
    this.size--;
    return node.v;
  }

  public max(): V | undefined {
    return last(this.root)?.v;
  }

  public iterator(): () => V | undefined {
    let curr = first(this.root);
    return () => {
      const res = curr;
      if (curr) curr = next(curr);
      return res ? res.v : undefined;
    };
  }

  public toString(tab: string = ''): string {
    return `${this.constructor.name}${this.root ? this.toStringNode(this.root, tab + '', '') : ' ∅'}`;
  }

  protected toStringNode(node: ITreeNode<K, V>, tab: string, side: 'l' | 'r' | ''): string {
    let str = `\n${tab}${side === 'l' ? ' ←' : side === 'r' ? ' →' : '└─'} ${node.constructor.name} ${node.k}`;
    if (node.l) str += this.toStringNode(node.l, tab + '  ', 'l');
    if (node.r) str += this.toStringNode(node.r, tab + '  ', 'r');
    return str;
  }
}
