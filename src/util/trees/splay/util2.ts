import type {HeadlessNode2} from '../types2';

export const splay2 = <N extends HeadlessNode2>(root: N, node: N): N => {
  const p = node.p2;
  if (!p) return root;
  const pp = p.p2;
  const l2 = p.l2 === node;
  if (!pp) {
    if (l2) rSplay2<N>(node, p as N);
    else lSplay2<N>(node, p as N);
    return node;
  }
  const l1 = pp.l2 === p;
  if (l1) {
    if (l2) {
      root = llSplay2<N>(root, node, p as N, pp as N);
    } else {
      root = lrSplay2<N>(root, node, p as N, pp as N);
    }
  } else {
    if (l2) {
      root = rlSplay2<N>(root, node, p as N, pp as N);
    } else {
      root = rrSplay2<N>(root, node, p as N, pp as N);
    }
  }
  return splay2(root, node);
};

const rSplay2 = <N extends HeadlessNode2>(c2: N, c1: N): void => {
  const b = c2.r2;
  c2.p2 = undefined;
  c2.r2 = c1;
  c1.p2 = c2;
  c1.l2 = b;
  if (b) b.p2 = c1;
};

const lSplay2 = <N extends HeadlessNode2>(c2: N, c1: N): void => {
  const b = c2.l2;
  c2.p2 = undefined;
  c2.l2 = c1;
  c1.p2 = c2;
  c1.r2 = b;
  if (b) b.p2 = c1;
};

const rrSplay2 = <N extends HeadlessNode2>(root: N, c3: N, c2: N, c1: N): N => {
  const b = c2.l2;
  const c = c3.l2;
  const p = c1.p2;
  c3.p2 = p;
  c3.l2 = c2;
  c2.p2 = c3;
  c2.l2 = c1;
  c2.r2 = c;
  c1.p2 = c2;
  c1.r2 = b;
  if (b) b.p2 = c1;
  if (c) c.p2 = c2;
  if (!p) root = c3;
  else if (p.l2 === c1) p.l2 = c3;
  else p.r2 = c3;
  return root;
};

const llSplay2 = <N extends HeadlessNode2>(root: N, c3: N, c2: N, c1: N): N => {
  const b = c2.r2;
  const c = c3.r2;
  const p = c1.p2;
  c3.p2 = p;
  c3.r2 = c2;
  c2.p2 = c3;
  c2.l2 = c;
  c2.r2 = c1;
  c1.p2 = c2;
  c1.l2 = b;
  if (b) b.p2 = c1;
  if (c) c.p2 = c2;
  if (!p) root = c3;
  else if (p.l2 === c1) p.l2 = c3;
  else p.r2 = c3;
  return root;
};

const lrSplay2 = <N extends HeadlessNode2>(root: N, c3: N, c2: N, c1: N): N => {
  const c = c3.l2;
  const d = c3.r2;
  const p = c1.p2;
  c3.p2 = p;
  c3.l2 = c2;
  c3.r2 = c1;
  c2.p2 = c3;
  c2.r2 = c;
  c1.p2 = c3;
  c1.l2 = d;
  if (c) c.p2 = c2;
  if (d) d.p2 = c1;
  if (!p) root = c3;
  else if (p.l2 === c1) p.l2 = c3;
  else p.r2 = c3;
  return root;
};

const rlSplay2 = <N extends HeadlessNode2>(root: N, c3: N, c2: N, c1: N): N => {
  const c = c3.r2;
  const d = c3.l2;
  const p = c1.p2;
  c3.p2 = p;
  c3.l2 = c1;
  c3.r2 = c2;
  c2.p2 = c3;
  c2.l2 = c;
  c1.p2 = c3;
  c1.r2 = d;
  if (c) c.p2 = c2;
  if (d) d.p2 = c1;
  if (!p) root = c3;
  else if (p.l2 === c1) p.l2 = c3;
  else p.r2 = c3;
  return root;
};
