import {stringify} from '../../../json-text/stringify';
import {printBinary} from '../../print/printBinary';
import type {Comparator} from '../types';
import type {IRbTreeNode, RbHeadlessNode} from './types';

export const insert = <K, N extends IRbTreeNode<K>>(root: N | undefined, n: N, comparator: Comparator<K>): N => {
  if (!root) return (n.b = true), n;
  const key = n.k;
  let curr: N | undefined = root;
  let next: N | undefined = undefined;
  let cmp: number = 0;
  while ((next = <N>((cmp = comparator(key, curr.k)) < 0 ? curr.l : curr.r))) curr = next;
  return (cmp < 0 ? insertLeft(root, n, curr) : insertRight(root, n, curr)) as N;
};

export const insertRight = (root: RbHeadlessNode, n: RbHeadlessNode, p: RbHeadlessNode): RbHeadlessNode => {
  const g = p.p;
  p.r = n;
  n.p = p;
  if (p.b || !g) return root;
  const top = rRebalance(n, p, g);
  return top.p ? root : top;
};

export const insertLeft = (root: RbHeadlessNode, n: RbHeadlessNode, p: RbHeadlessNode): RbHeadlessNode => {
  const g = p.p;
  p.l = n;
  n.p = p;
  if (p.b || !g) return root;
  const top = lRebalance(n, p, g);
  return top.p ? root : top;
};

const rRebalance = (n: RbHeadlessNode, p: RbHeadlessNode, g: RbHeadlessNode): RbHeadlessNode => {
  const u = g.l === p ? g.r : g.l;
  const uncleIsBlack = !u || u.b;
  if (uncleIsBlack) {
    const zigzag = g.l === p;
    g.b = false;
    if (zigzag) {
      n.b = true;
      rrRotate(p, n);
      llRotate(g, n);
      return n;
    }
    p.b = true;
    rrRotate(g, p);
    return p;
  }
  return recolor(p, g, u);
};

const lRebalance = (n: RbHeadlessNode, p: RbHeadlessNode, g: RbHeadlessNode): RbHeadlessNode => {
  const u = g.l === p ? g.r : g.l;
  const uncleIsBlack = !u || u.b;
  if (uncleIsBlack) {
    const zigzag = g.r === p;
    g.b = false;
    if (zigzag) {
      n.b = true;
      llRotate(p, n);
      rrRotate(g, n);
      return n;
    }
    p.b = true;
    llRotate(g, p);
    return p;
  }
  return recolor(p, g, u);
};

const recolor = (p: RbHeadlessNode, g: RbHeadlessNode, u?: RbHeadlessNode): RbHeadlessNode => {
  p.b = true;
  g.b = false;
  if (u) u.b = true;
  const gg = g.p;
  if (!gg) return (g.b = true), g;
  if (gg.b) return g;
  const ggg = gg.p;
  if (!ggg) return (gg.b = true), gg;
  return gg.l === g ? lRebalance(g, gg, ggg) : rRebalance(g, gg, ggg);
};

const llRotate = (n: RbHeadlessNode, nl: RbHeadlessNode): void => {
  const p = n.p;
  const nlr = nl.r;
  nl.p = p;
  nl.r = n;
  n.p = nl;
  n.l = nlr;
  nlr && (nlr.p = n);
  p && (p.l === n ? (p.l = nl) : (p.r = nl));
};

const rrRotate = (n: RbHeadlessNode, nr: RbHeadlessNode): void => {
  const p = n.p;
  const nrl = nr.l;
  nr.p = p;
  nr.l = n;
  n.p = nr;
  n.r = nrl;
  nrl && (nrl.p = n);
  p && (p.l === n ? (p.l = nr) : (p.r = nr));
};

export const remove = <K, N extends IRbTreeNode<K>>(root: N | undefined, n: N): N | undefined => {
  throw new Error('Not implemented');
};

export const print = (node: undefined | RbHeadlessNode | IRbTreeNode, tab: string = ''): string => {
  if (!node) return '∅';
  const {b, l, r, k, v} = node as IRbTreeNode;
  const content = k !== undefined ? ` { ${stringify(k)} = ${stringify(v)} }` : '';
  const bfFormatted = !b ? ` [red]` : '';
  return (
    node.constructor.name +
    `${bfFormatted}` +
    content +
    printBinary(tab, [l ? (tab) => print(l, tab) : null, r ? (tab) => print(r, tab) : null])
  );
};
