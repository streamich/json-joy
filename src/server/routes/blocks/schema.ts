import {type ResolveType, t} from '../../../json-type';

export type TBlock = ResolveType<typeof Block>;
export const Block = t.Object(
  t.prop('id', t.str),
  t.prop('seq', t.num),
  t.prop('created', t.num),
  t.prop('updated', t.num),
  t.prop('blob', t.bin),
);

export type TBlockPatch = ResolveType<typeof BlockPatch>;
export const BlockPatch = t.Object(t.prop('seq', t.num), t.prop('created', t.num), t.prop('blob', t.bin));
