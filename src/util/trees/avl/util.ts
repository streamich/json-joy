import {stringify} from '../../../json-text/stringify';
import {printBinary} from '../../print/printBinary';
import type {Comparator} from '../types';
import type {AvlHeadlessNode, IAvlTreeNode} from './types';

const rebalanceAfterInsert = (
  root: AvlHeadlessNode,
  node: AvlHeadlessNode,
  child: AvlHeadlessNode,
): AvlHeadlessNode => {
  const p = node.p;
  if (!p) return root;
  const isLeft = node === p.l;
  let bf = p.bf | 0;
  if (isLeft) p.bf = ++bf;
  else p.bf = --bf;
  switch (bf) {
    case 0:
      return root;
    case 1:
    case -1:
      return rebalanceAfterInsert(root, p, node);
    default: {
      const isChildLeft = child === node.l;
      if (isLeft) {
        if (isChildLeft) return llRotate(p, node), node.p ? root : node;
        else return lrRotate(p, node, child), child.p ? root : child;
      } else {
        if (isChildLeft) return rlRotate(p, node, child), child.p ? root : child;
        else return rrRotate(p, node), node.p ? root : node;
      }
    }
  }
};

const llRotate = (n: AvlHeadlessNode, nl: AvlHeadlessNode): void => {
  const p = n.p;
  const nlr = nl.r;
  nl.p = p;
  nl.r = n;
  n.p = nl;
  n.l = nlr;
  nlr && (nlr.p = n);
  p && (p.l === n ? (p.l = nl) : (p.r = nl));
  let nbf = n.bf;
  let nlbf = nl.bf;
  nbf += -1 - (nlbf > 0 ? nlbf : 0);
  nlbf += -1 + (nbf < 0 ? nbf : 0);
  n.bf = nbf;
  nl.bf = nlbf;
};

const rrRotate = (n: AvlHeadlessNode, nr: AvlHeadlessNode): void => {
  const p = n.p;
  const nrl = nr.l;
  nr.p = p;
  nr.l = n;
  n.p = nr;
  n.r = nrl;
  nrl && (nrl.p = n);
  p && (p.l === n ? (p.l = nr) : (p.r = nr));
  let nbf = n.bf;
  let nrbf = nr.bf;
  nbf += 1 - (nrbf < 0 ? nrbf : 0);
  nrbf += 1 + (nbf > 0 ? nbf : 0);
  n.bf = nbf;
  nr.bf = nrbf;
};

const lrRotate = (n: AvlHeadlessNode, nl: AvlHeadlessNode, nlr: AvlHeadlessNode): void => {
  rrRotate(nl, nlr);
  llRotate(n, nlr);
};

const rlRotate = (n: AvlHeadlessNode, nr: AvlHeadlessNode, nrl: AvlHeadlessNode): void => {
  llRotate(nr, nrl);
  rrRotate(n, nrl);
};

export const insertRight = (root: AvlHeadlessNode, n: AvlHeadlessNode, p: AvlHeadlessNode): AvlHeadlessNode => {
  p.r = n;
  n.p = p;
  p.bf--;
  return p.l ? root : rebalanceAfterInsert(root, p, n);
};

export const insertLeft = (root: AvlHeadlessNode, n: AvlHeadlessNode, p: AvlHeadlessNode): AvlHeadlessNode => {
  p.l = n;
  n.p = p;
  p.bf++;
  return p.r ? root : rebalanceAfterInsert(root, p, n);
};

export const insert = <K, N extends IAvlTreeNode<K>>(root: N | undefined, node: N, comparator: Comparator<K>): N => {
  if (!root) return node;
  const key = node.k;
  let curr: N | undefined = root;
  let next: N | undefined = undefined;
  let cmp: number = 0;
  while ((next = <N>((cmp = comparator(key, curr.k)) < 0 ? curr.l : curr.r))) curr = next;
  return (cmp < 0 ? insertLeft(root, node, curr) : insertRight(root, node, curr)) as N;
};

export const remove = <K, N extends IAvlTreeNode<K>>(root: N | undefined, n: N): N | undefined => {
  if (!root) return n;
  const p = n.p;
  const l = n.l;
  const r = n.r;
  n.p = n.l = n.r = undefined;
  if (l && r) {
    const lr = l.r;
    if (!lr) {
      p && (p.l === n ? (p.l = l) : (p.r = l));
      l.p = p;
      l.r = r;
      r.p = l;
      const nbf = n.bf;
      if (p) return (l.bf = nbf), lRebalance(root, l, 1) as N;
      const lbf = nbf - 1;
      l.bf = lbf;
      if (lbf >= -1) return l as N;
      const rl = r.l;
      return r.bf > 0 ? ((rlRotate(l, r, rl!), rl) as N) : (rrRotate(l, r), r as N);
    } else {
      let v = l; // in-order predecessor
      let tmp: typeof v | undefined = v;
      while ((tmp = v.r)) v = tmp;
      const vl = v.l;
      const vp = v.p;
      const vc = vl;
      p && (p.l === n ? (p.l = v) : (p.r = v));
      v.p = p;
      v.r = r;
      v.bf = n.bf;
      l !== v && ((v.l = l), (l.p = v));
      r.p = v;
      vp && (vp.l === v ? (vp.l = vc) : (vp.r = vc));
      vc && (vc.p = vp);
      return rRebalance(p ? root : v, vp!, 1) as N;
    }
  }
  const c = (l || r) as N | undefined;
  c && (c.p = p);
  if (!p) return c;
  return p.l === n ? ((p.l = c), lRebalance(root, p, 1) as N) : ((p.r = c), rRebalance(root, p, 1) as N);
};

const lRebalance = (root: AvlHeadlessNode | undefined, n: AvlHeadlessNode, d: 1 | 0): AvlHeadlessNode | undefined => {
  let bf = n.bf | 0;
  bf -= d;
  n.bf = bf;
  let nextD: 1 | 0 = d;
  if (bf === -1) return root;
  if (bf < -1) {
    const u = n.r!;
    if (u.bf <= 0) {
      if (u.l && u.bf === 0) nextD = 0;
      rrRotate(n, u);
      n = u;
    } else {
      const ul = u.l!;
      rlRotate(n, u, ul);
      n = ul;
    }
  }
  const p = n.p;
  if (!p) return n;
  return p.l === n ? lRebalance(root, p, nextD) : rRebalance(root, p, nextD);
};

const rRebalance = (root: AvlHeadlessNode | undefined, n: AvlHeadlessNode, d: 1 | 0): AvlHeadlessNode | undefined => {
  let bf = n.bf | 0;
  bf += d;
  n.bf = bf;
  let nextD: 1 | 0 = d;
  if (bf === 1) return root;
  if (bf > 1) {
    const u = n.l!;
    if (u.bf >= 0) {
      if (u.r && u.bf === 0) nextD = 0;
      llRotate(n, u);
      n = u;
    } else {
      const ur = u.r!;
      lrRotate(n, u, ur);
      n = ur;
    }
  }
  const p = n.p;
  if (!p) return n;
  return p.l === n ? lRebalance(root, p, nextD) : rRebalance(root, p, nextD);
};

export const print = (node: undefined | AvlHeadlessNode | IAvlTreeNode, tab: string = ''): string => {
  if (!node) return '∅';
  const {bf, l, r, k, v} = node as IAvlTreeNode;
  const content = k !== undefined ? ` { ${stringify(k)} = ${stringify(v)} }` : '';
  const bfFormatted = bf ? ` [${bf}]` : '';
  return (
    node.constructor.name +
    `${bfFormatted}` +
    content +
    printBinary(tab, [l ? (tab) => print(l, tab) : null, r ? (tab) => print(r, tab) : null])
  );
};
