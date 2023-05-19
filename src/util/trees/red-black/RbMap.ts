import {insert, insertLeft, insertRight, print} from './util';
import {printTree} from '../../print/printTree';
import {findOrNextLower, first, next} from '../util';
import type {Printable} from '../../print/types';
import type {Comparator, HeadlessNode} from '../types';
import type {IRbTreeNode} from './types';
import type {AvlNodeReference} from '../avl/types';

export class RbNode<K, V> implements IRbTreeNode<K, V> {
  public p: RbNode<K, V> | undefined = undefined;
  public l: RbNode<K, V> | undefined = undefined;
  public r: RbNode<K, V> | undefined = undefined;
  public b: boolean = false;
  constructor(public readonly k: K, public v: V) {}
}

const defaultComparator = (a: unknown, b: unknown) => (a === b ? 0 : (a as any) < (b as any) ? -1 : 1);

export class RbMap<K, V> implements Printable {
  public root: RbNode<K, V> | undefined = undefined;
  public readonly comparator: Comparator<K>;

  constructor(comparator?: Comparator<K>) {
    this.comparator = comparator || defaultComparator;
  }

  public insert(k: K, v: V): AvlNodeReference<RbNode<K, V>> {
    const item = new RbNode<K, V>(k, v);
    this.root = insert(this.root, item, this.comparator);
    return item;
  }

  public set(k: K, v: V): AvlNodeReference<RbNode<K, V>> {
    const root = this.root;
    if (!root) return this.insert(k, v);
    const comparator = this.comparator;
    let next: RbNode<K, V> | undefined = root,
      curr: RbNode<K, V> | undefined = next;
    let cmp: number = 0;
    do {
      curr = next;
      cmp = comparator(k, curr.k);
      if (cmp === 0) return (curr.v = v), curr;
    } while ((next = cmp < 0 ? (curr.l as RbNode<K, V>) : (curr.r as RbNode<K, V>)));
    const node = new RbNode<K, V>(k, v);
    this.root =
      cmp < 0 ? (insertLeft(root, node, curr) as RbNode<K, V>) : (insertRight(root, node, curr) as RbNode<K, V>);
    return node;
  }

  public find(k: K): AvlNodeReference<RbNode<K, V>> | undefined {
    const comparator = this.comparator;
    let curr: RbNode<K, V> | undefined = this.root;
    while (curr) {
      const cmp = comparator(k, curr.k);
      if (cmp === 0) return curr;
      curr = cmp < 0 ? (curr.l as RbNode<K, V>) : (curr.r as RbNode<K, V>);
    }
    return undefined;
  }

  public get(k: K): V | undefined {
    return this.find(k)?.v;
  }

  public has(k: K): boolean {
    return !!this.find(k);
  }

  public getOrNextLower(k: K): RbNode<K, V> | undefined {
    return (findOrNextLower(this.root, k, this.comparator) as RbNode<K, V>) || undefined;
  }

  public forEach(fn: (node: RbNode<K, V>) => void): void {
    const root = this.root;
    if (!root) return;
    let curr = first(root);
    do fn(curr!);
    while ((curr = next(curr as HeadlessNode) as RbNode<K, V> | undefined));
  }

  public toString(tab: string): string {
    return this.constructor.name + printTree(tab, [(tab) => print(this.root, tab)]);
  }
}
