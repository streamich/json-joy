import type {HeadlessNode} from '../types';

export const splay = <N extends HeadlessNode>(root: N, node: N, repeat: number): N => {
  const p = node.p;
  if (!p) return root;
  const pp = p.p;
  const l2 = p.l === node;
  if (!pp) {
    if (l2) rSplay<N>(node, p as N);
    else lSplay<N>(node, p as N);
    return node;
  }
  const l1 = pp.l === p;
  if (l1) {
    if (l2) {
      root = llSplay<N>(root, node, p as N, pp as N);
    } else {
      root = lrSplay<N>(root, node, p as N, pp as N);
    }
  } else {
    if (l2) {
      root = rlSplay<N>(root, node, p as N, pp as N);
    } else {
      root = rrSplay<N>(root, node, p as N, pp as N);
    }
  }
  if (repeat > 1) return splay(root, node, repeat - 1);
  return root;
};

export const rSplay = <N extends HeadlessNode>(c2: N, c1: N): void => {
  const b = c2.r;
  c2.p = undefined;
  c2.r = c1;
  c1.p = c2;
  c1.l = b;
  if (b) b.p = c1;
};

export const lSplay = <N extends HeadlessNode>(c2: N, c1: N): void => {
  const b = c2.l;
  c2.p = undefined;
  c2.l = c1;
  c1.p = c2;
  c1.r = b;
  if (b) b.p = c1;
};

export const rrSplay = <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N): N => {
  const b = c2.l;
  const c = c3.l;
  const p = c1.p;
  c3.p = p;
  c3.l = c2;
  c2.p = c3;
  c2.l = c1;
  c2.r = c;
  c1.p = c2;
  c1.r = b;
  if (b) b.p = c1;
  if (c) c.p = c2;
  if (!p) root = c3;
  else if (p.l === c1) p.l = c3;
  else p.r = c3;
  return root;
};

export const llSplay = <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N): N => {
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
  if (b) b.p = c1;
  if (c) c.p = c2;
  if (!p) root = c3;
  else if (p.l === c1) p.l = c3;
  else p.r = c3;
  return root;
};

export const lrSplay = <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N): N => {
  const c = c3.l;
  const d = c3.r;
  const p = c1.p;
  c3.p = p;
  c3.l = c2;
  c3.r = c1;
  c2.p = c3;
  c2.r = c;
  c1.p = c3;
  c1.l = d;
  if (c) c.p = c2;
  if (d) d.p = c1;
  if (!p) root = c3;
  else if (p.l === c1) p.l = c3;
  else p.r = c3;
  return root;
};

export const rlSplay = <N extends HeadlessNode>(root: N, c3: N, c2: N, c1: N): N => {
  const c = c3.r;
  const d = c3.l;
  const p = c1.p;
  c3.p = p;
  c3.l = c1;
  c3.r = c2;
  c2.p = c3;
  c2.l = c;
  c1.p = c3;
  c1.r = d;
  if (c) c.p = c2;
  if (d) d.p = c1;
  if (!p) root = c3;
  else if (p.l === c1) p.l = c3;
  else p.r = c3;
  return root;
};
