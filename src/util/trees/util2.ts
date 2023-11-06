import type {Comparator2, HeadlessNode2} from './types2';

export const first2 = <N extends HeadlessNode2>(root: N | undefined): N | undefined => {
  let curr = root;
  while (curr)
    if (curr.l2) curr = curr.l2 as N;
    else return curr;
  return curr;
};

export const last2 = <N extends HeadlessNode2>(root: N | undefined): N | undefined => {
  let curr = root;
  while (curr)
    if (curr.r2) curr = curr.r2 as N;
    else return curr;
  return curr;
};

export const next2 = <N extends HeadlessNode2>(curr: N): N | undefined => {
  if (curr.r2) {
    curr = curr.r2 as N;
    while (curr.l2) curr = curr.l2 as N;
    return curr;
  }
  let p = curr.p2 as N;
  while (p && p.r2 === curr) {
    curr = p;
    p = p.p2 as N;
  }
  return p;
};

export const prev2 = <N extends HeadlessNode2>(curr: N): N | undefined => {
  if (curr.l2) {
    curr = curr.l2 as N;
    while (curr.r2) curr = curr.r2 as N;
    return curr;
  }
  let p = curr.p2 as N;
  while (p && p.l2 === curr) {
    curr = p;
    p = p.p2 as N;
  }
  return p;
};

const insertRight2 = <K = unknown, V = unknown>(node: HeadlessNode2, p: HeadlessNode2): void => {
  const r = (node.r2 = p.r2);
  p.r2 = node;
  node.p2 = p;
  if (r) r.p2 = node;
};

const insertLeft2 = <K = unknown, V = unknown>(node: HeadlessNode2, p: HeadlessNode2): void => {
  const l = (node.l2 = p.l2);
  p.l2 = node;
  node.p2 = p;
  if (l) l.p2 = node;
};

export const insert2 = <N extends HeadlessNode2>(root: N | undefined, node: N, comparator: Comparator2<N>): N => {
  if (!root) return node;
  let curr: N | undefined = root;
  while (curr) {
    const cmp = comparator(node, curr);
    const next: N | undefined = cmp < 0 ? (curr.l2 as N) : (curr.r2 as N);
    if (!next) {
      if (cmp < 0) insertLeft2(node, curr);
      else insertRight2(node, curr);
      break;
    } else curr = next;
  }
  return root;
};

export const remove2 = <N extends HeadlessNode2>(root: N | undefined, node: N): N | undefined => {
  const p = node.p2;
  const l = node.l2;
  const r = node.r2;
  node.p2 = node.l2 = node.r2 = undefined;
  if (!l && !r) {
    if (!p) return undefined;
    else if (p.l2 === node) p.l2 = undefined;
    else p.r2 = undefined;
    return root;
  } else if (l && r) {
    let mostRightChildFromLeft = l;
    while (mostRightChildFromLeft.r2) mostRightChildFromLeft = mostRightChildFromLeft.r2;
    mostRightChildFromLeft.r2 = r;
    r.p2 = mostRightChildFromLeft;
    if (!p) {
      l.p2 = undefined;
      return l as N;
    }
    if (p.l2 === node) p.l2 = l;
    else p.r2 = l;
    l.p2 = p;
    return root;
  }
  const child = (l || r)!;
  child.p2 = p;
  if (!p) return child as N;
  else if (p.l2 === node) p.l2 = child;
  else p.r2 = child;
  return root;
};
