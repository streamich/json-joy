import {insert, insertLeft, insertRight, print} from './util';
import {printTree} from '../../print/printTree';
import {findOrNextLower, first, next} from '../util';
import type {Printable} from '../../print/types';
import type {Comparator, HeadlessNode} from '../types';
import type {AvlNodeReference, IAvlTreeNode} from './types';

export class AvlNode<K, V> implements IAvlTreeNode<K, V> {
  public p: AvlNode<K, V> | undefined = undefined;
  public l: AvlNode<K, V> | undefined = undefined;
  public r: AvlNode<K, V> | undefined = undefined;
  public bf: number = 0;
  constructor(public readonly k: K, public v: V) {}
}

const defaultComparator = (a: unknown, b: unknown) => (a === b ? 0 : (a as any) < (b as any) ? -1 : 1);

export class AvlBstMap<K, V> implements Printable {
  public root: AvlNode<K, V> | undefined = undefined;
  public readonly comparator: Comparator<K>;

  constructor(comparator?: Comparator<K>) {
    this.comparator = comparator || defaultComparator;
  }

  public insert(k: K, v: V): AvlNodeReference<AvlNode<K, V>> {
    const item = new AvlNode<K, V>(k, v);
    this.root = insert(this.root, item, this.comparator);
    return item;
  }

  public set(k: K, v: V): AvlNodeReference<AvlNode<K, V>> {
    const root = this.root;
    if (!root) return this.insert(k, v);
    const comparator = this.comparator;
    let next: AvlNode<K, V> | undefined = root,
      curr: AvlNode<K, V> | undefined = next;
    let cmp: number = 0;
    do {
      curr = next;
      cmp = comparator(k, curr.k);
      if (cmp === 0) return (curr.v = v), curr;
    } while ((next = cmp < 0 ? (curr.l as AvlNode<K, V>) : (curr.r as AvlNode<K, V>)));
    const node = new AvlNode<K, V>(k, v);
    this.root =
      cmp < 0 ? (insertLeft(root, node, curr) as AvlNode<K, V>) : (insertRight(root, node, curr) as AvlNode<K, V>);
    return node;
  }

  public find(k: K): AvlNodeReference<AvlNode<K, V>> | undefined {
    const comparator = this.comparator;
    let curr: AvlNode<K, V> | undefined = this.root;
    while (curr) {
      const cmp = comparator(k, curr.k);
      if (cmp === 0) return curr;
      curr = cmp < 0 ? (curr.l as AvlNode<K, V>) : (curr.r as AvlNode<K, V>);
    }
    return undefined;
  }

  public get(k: K): V | undefined {
    return this.find(k)?.v;
  }

  public has(k: K): boolean {
    return !!this.find(k);
  }

  public getOrNextLower(k: K): AvlNode<K, V> | undefined {
    return (findOrNextLower(this.root, k, this.comparator) as AvlNode<K, V>) || undefined;
  }

  public forEach(fn: (node: AvlNode<K, V>) => void): void {
    const root = this.root;
    if (!root) return;
    let curr = first(root);
    do fn(curr!);
    while ((curr = next(curr as HeadlessNode) as AvlNode<K, V> | undefined));
  }

  public toString(tab: string): string {
    return this.constructor.name + printTree(tab, [(tab) => print(this.root, tab)]);
  }
}
