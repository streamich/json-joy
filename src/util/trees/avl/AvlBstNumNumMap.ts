import {insert, insertLeft, insertRight, print} from './util';
import {printTree} from '../../print/printTree';
import {findOrNextLower, first, next} from '../util';
import type {Printable} from '../../print/types';
import type {HeadlessNode} from '../types';
import type {AvlNodeReference, IAvlTreeNode} from './types';

export class NumNumItem implements IAvlTreeNode<number, number> {
  public p: NumNumItem | undefined = undefined;
  public l: NumNumItem | undefined = undefined;
  public r: NumNumItem | undefined = undefined;
  public bf: number = 0;
  constructor(public readonly k: number, public v: number) {}
}

const comparator = (a: number, b: number) => a - b;

export class AvlBstNumNumMap implements Printable {
  public root: NumNumItem | undefined = undefined;

  public insert(k: number, v: number): AvlNodeReference<NumNumItem> {
    const item = new NumNumItem(k, v);
    this.root = insert(this.root, item, comparator);
    return item;
  }

  public set(k: number, v: number): AvlNodeReference<NumNumItem> {
    const root = this.root;
    if (!root) return this.insert(k, v);
    let next: NumNumItem | undefined = root,
      curr: NumNumItem | undefined = next;
    let cmp: number = 0;
    do {
      curr = next;
      cmp = comparator(k, curr.k);
      if (cmp === 0) return (curr.v = v), curr;
    } while ((next = cmp < 0 ? ((curr as any).l as NumNumItem) : ((curr as any).r as NumNumItem)));
    const node = new NumNumItem(k, v);
    this.root = cmp < 0 ? (insertLeft(root, node, curr) as NumNumItem) : (insertRight(root, node, curr) as NumNumItem);
    return node;
  }

  public find(k: number): AvlNodeReference<NumNumItem> | undefined {
    let curr: NumNumItem | undefined = this.root;
    while (curr) {
      const cmp = comparator(k, curr.k);
      if (cmp === 0) return curr;
      curr = cmp < 0 ? ((curr as any).l as NumNumItem) : ((curr as any).r as NumNumItem);
    }
    return undefined;
  }

  public get(k: number): number | undefined {
    return this.find(k)?.v;
  }

  public has(k: number): boolean {
    return !!this.find(k);
  }

  public getOrNextLower(k: number): NumNumItem | undefined {
    return (findOrNextLower(this.root, k, comparator) as NumNumItem) || undefined;
  }

  public forEach(fn: (node: NumNumItem) => void): void {
    const root = this.root;
    if (!root) return;
    let curr = first(root);
    do fn(curr!);
    while ((curr = next(curr as HeadlessNode) as NumNumItem | undefined));
  }

  public toString(tab: string): string {
    return this.constructor.name + printTree(tab, [(tab) => print(this.root, tab)]);
  }
}
