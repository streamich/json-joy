import {Printable} from '../../print/types';
import {TrieNode} from '../trie/TrieNode';
import {insert, find, remove} from './radix';

export class RadixTree<V = unknown> extends TrieNode<V> implements Printable {
  public size: number = 0;

  constructor() {
    super('', undefined as any as V);
  }

  public set(key: string, value: V): void {
    this.size += insert(this, key, value);
  }

  public get(key: string): V | undefined {
    const node = find(this, key) as TrieNode<V> | undefined;
    return node && node.v;
  }

  public delete(key: string): boolean {
    const removed = remove(this, key);
    if (removed) this.size--;
    return removed;
  }
}
