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

const size_ = <N extends HeadlessNode>(root: N): number => {
  const l = root.l;
  const r = root.r;
  return 1 + (l ? size_(l) : 0) + (r ? size_(r) : 0);
};

export const size = <N extends HeadlessNode>(root: N | undefined): number => {
  return root ? size_(root) : 0;
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
    /** @todo perf: see if it is possible to take this condition outside of the loop. */
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
