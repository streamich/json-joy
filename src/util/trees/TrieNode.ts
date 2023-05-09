import {print, toRecord} from './radix';
import {first, next} from './util';
import type {Printable} from '../print/types';
import type {ITreeNode} from './types';

export class TrieNode<V = unknown> implements ITreeNode<string, unknown>, Printable {
  public p: TrieNode<V> | undefined = undefined;
  public l: TrieNode<V> | undefined = undefined;
  public r: TrieNode<V> | undefined = undefined;
  public children: TrieNode<V> | undefined = undefined;

  constructor(public k: string, public v: V) {}

  public forChildren(callback: (child: TrieNode<V>, index: number) => void): void {
    let child = first(this.children);
    let i = 0;
    while (child) {
      callback(child, 0);
      i++;
      child = next(child);
    }
  }

  public toRecord(prefix?: string, record?: Record<string, unknown>): Record<string, unknown> {
    return toRecord(this, prefix, record);
  }

  public toString(tab: string = ''): string {
    return print(this, tab);
  }
}
