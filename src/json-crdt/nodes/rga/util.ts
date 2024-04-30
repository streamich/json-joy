import type {AbstractRga, Chunk} from "./AbstractRga";

/** Find the first visible chunk, if any. */
export const firstVis = <T>(rga: AbstractRga<T>): Chunk<T> | undefined => {
  let curr = rga.first();
  if (!curr) return;
  while (curr.del) {
    curr = rga.next(curr);
    if (!curr) return;
  }
  return curr;
};
