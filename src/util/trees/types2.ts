export interface HeadlessNode2 {
  p2: HeadlessNode2 | undefined;
  l2: HeadlessNode2 | undefined;
  r2: HeadlessNode2 | undefined;
}

export type Comparator2<T extends HeadlessNode2> = (a: T, b: T) => number;
