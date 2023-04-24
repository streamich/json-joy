import type {Comparator, HeadlessNode, ITreeNode} from './types';

export const first = <N extends HeadlessNode>(root: N | undefined): N | undefined => {
  let curr = root;
  while (curr)
    if (curr.l) curr = curr.l as N;
    else return curr;
  return curr;
};

export const last = <N extends HeadlessNode>(root: N | undefined): N | undefined => {
  let curr = root;
  while (curr)
    if (curr.r) curr = curr.r as N;
    else return curr;
  return curr;
};

export const next = <N extends HeadlessNode>(curr: N): N | undefined => {
  if (curr.r) {
    curr = curr.r as N;
    while (curr.l) curr = curr.l as N;
    return curr;
  }
  let p = curr.p as N;
  while (p && p.r === curr) {
    curr = p;
    p = p.p as N;
  }
  return p;
};

export const prev = <N extends HeadlessNode>(curr: N): N | undefined => {
  if (curr.l) {
    curr = curr.l as N;
    while (curr.r) curr = curr.r as N;
    return curr;
  }
  let p = curr.p as N;
  while (p && p.l === curr) {
    curr = p;
    p = p.p as N;
  }
  return p;
};

export const size = <N extends HeadlessNode>(root: N | undefined): number => {
  if (!root) return 0;
  const start = first(root)!;
  let curr: N | undefined = start;
  let result = 1;
  while ((curr = next(curr))) result++;
  return result;
};

export const find = <K = unknown, V = unknown>(
  root: ITreeNode<K, V> | undefined,
  key: K,
  comparator: Comparator<K>,
): ITreeNode<K, V> | undefined => {
  let curr: ITreeNode<K, V> | undefined = root;
  while (curr) {
    const cmp = comparator(key, curr.k);
    if (cmp === 0) return curr;
    curr = cmp < 0 ? curr.l : curr.r;
  }
  return curr;
};

export const findOrNextLower = <K = unknown, V = unknown>(
  root: ITreeNode<K, V> | undefined,
  key: K,
  comparator: Comparator<K>,
): ITreeNode<K, V> | undefined => {
  let curr: ITreeNode<K, V> | undefined = root;
  let result: ITreeNode<K, V> | undefined = undefined;
  while (curr) {
    const cmp = comparator(curr.k, key);
    if (cmp === 0) return curr;
    if (cmp > 0) curr = curr.l;
    else {
      const next = curr.r;
      result = curr;
      if (!next) return result;
      curr = next;
    }
  }
  return result;
};

export const insertRight = <K = unknown, V = unknown>(node: HeadlessNode, p: HeadlessNode): void => {
  const r = (node.r = p.r);
  p.r = node;
  node.p = p;
  if (r) r.p = node;
};

export const insertLeft = <K = unknown, V = unknown>(node: HeadlessNode, p: HeadlessNode): void => {
  const l = (node.l = p.l);
  p.l = node;
  node.p = p;
  if (l) l.p = node;
};

export const insert = <K = unknown, V = unknown>(
  root: ITreeNode<K, V> | undefined,
  node: ITreeNode<K, V>,
  comparator: Comparator<K>,
): ITreeNode<K, V> => {
  if (!root) return node;
  const key = node.k;
  let curr: ITreeNode<K, V> | undefined = root;
  while (curr) {
    const cmp = comparator(key, curr.k);
    const next: ITreeNode<K, V> | undefined = cmp < 0 ? curr.l : curr.r;
    if (!next) {
      if (cmp < 0) insertLeft(node, curr);
      else insertRight(node, curr);
      break;
    } else curr = next;
  }
  return root;
};

export const remove = <N extends HeadlessNode>(root: N | undefined, node: N): N | undefined => {
  const p = node.p;
  const l = node.l;
  const r = node.r;
  node.p = node.l = node.r = undefined;
  if (!l && !r) {
    if (!p) return undefined;
    else if (p.l === node) p.l = undefined;
    else p.r = undefined;
    return root;
  } else if (l && r) {
    let mostRightChildFromLeft = l;
    while (mostRightChildFromLeft.r) mostRightChildFromLeft = mostRightChildFromLeft.r;
    mostRightChildFromLeft.r = r;
    r.p = mostRightChildFromLeft;
    if (!p) {
      l.p = undefined;
      return l as N;
    }
    if (p.l === node) p.l = l;
    else p.r = l;
    l.p = p;
    return root;
  }
  const child = (l || r)!;
  child.p = p;
  if (!p) return child as N;
  else if (p.l === node) p.l = child;
  else p.r = child;
  return root;
};

export const splay = <N extends HeadlessNode>(root: N, node: N, repeat: number): N => {
  const p = node.p;
  if (!p) return root;
  const pp = p.p;
  const l2 = p.l === node;
  if (!pp) return l2 ? rSplay<N>(node, p as N) : lSplay<N>(node, p as N);
  const l1 = pp.l === p;
  if (l1 && l2) root = llSplay<N>(root, node, p as N, pp as N);
  else if (!l1 && !l2) root = rrSplay<N>(root, node, p as N, pp as N);
  else if (l1 && !l2) root = lrSplay<N>(root, node, p as N, pp as N);
  else root = rlSplay<N>(root, node, p as N, pp as N);
  if (repeat > 1) return splay(root, node, repeat - 1);
  return root;
};

export const rSplay = <N extends HeadlessNode>(c2: N, c1: N): N => {
  const b = c2.r;
  c2.p = undefined;
  c2.r = c1;
  c1.p = c2;
  c1.l = b;
  if (b) b.p = c1;
  return c2;
};

export const lSplay = <N extends HeadlessNode>(c2: N, c1: N): N => {
  const b = c2.l;
  c2.p = undefined;
  c2.l = c1;
  c1.p = c2;
  c1.r = b;
  if (b) b.p = c1;
  return c2;
};

export const rrSplay = <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N): N => {
  const a = c1.l;
  const b = c2.l;
  const c = c3.l;
  const p = c1.p;
  c3.p = p;
  c3.l = c2;
  c2.p = c3;
  c2.l = c1;
  c2.r = c;
  c1.p = c2;
  c1.l = a;
  c1.r = b;
  if (a) a.p = c1;
  if (b) b.p = c1;
  if (c) c.p = c2;
  if (!p) root = c3;
  else if (p.l === c1) p.l = c3;
  else p.r = c3;
  return root;
};

export const llSplay = <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N): N => {
  const a = c1.r;
  const b = c2.r;
  const c = c3.r;
  const p = c1.p;
  c3.p = p;
  c3.r = c2;
  c2.p = c3;
  c2.l = c;
  c2.r = c1;
  c1.p = c2;
  c1.l = b;
  c1.r = a;
  if (a) a.p = c1;
  if (b) b.p = c1;
  if (c) c.p = c2;
  if (!p) root = c3;
  else if (p.l === c1) p.l = c3;
  else p.r = c3;
  return root;
};

export const lrSplay = <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N): N => {
  const a = c1.r;
  const b = c2.l;
  const c = c3.l;
  const d = c3.r;
  const p = c1.p;
  c3.p = p;
  c3.l = c2;
  c3.r = c1;
  c2.p = c3;
  c2.l = b;
  c2.r = c;
  c1.p = c3;
  c1.l = d;
  c1.r = a;
  if (a) a.p = c1;
  if (b) b.p = c2;
  if (c) c.p = c2;
  if (d) d.p = c1;
  if (!p) root = c3;
  else if (p.l === c1) p.l = c3;
  else p.r = c3;
  return root;
};

export const rlSplay = <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N): N => {
  const a = c1.l;
  const b = c2.r;
  const c = c3.r;
  const d = c3.l;
  const p = c1.p;
  c3.p = p;
  c3.l = c1;
  c3.r = c2;
  c2.p = c3;
  c2.l = c;
  c2.r = b;
  c1.p = c3;
  c1.l = a;
  c1.r = d;
  if (a) a.p = c1;
  if (b) b.p = c2;
  if (c) c.p = c2;
  if (d) d.p = c1;
  if (!p) root = c3;
  else if (p.l === c1) p.l = c3;
  else p.r = c3;
  return root;
};
