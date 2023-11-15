import {type ResolveType, t} from '../../../json-type';

export type TBlockId = ResolveType<typeof BlockId>;
export const BlockId = t.str.options({
  title: 'Block ID',
  min: 6,
  max: 40,
});

export type TBlockSeq = ResolveType<typeof BlockSeq>;
export const BlockSeq = t.num.options({
  title: 'Block Sequence Number',
  gte: 0,
  format: 'u32',
});

export type TBlock = ResolveType<typeof Block>;
export const Block = t.Object(
  t.prop('id', t.Ref<typeof BlockId>('BlockId')),
  t.prop('seq', t.Ref<typeof BlockSeq>('BlockSeq')),
  t.prop('created', t.num),
  t.prop('updated', t.num),
  t.prop('blob', t.bin),
);

export type TBlockPatch = ResolveType<typeof BlockPatch>;
export const BlockPatch = t.Object(t.prop('seq', t.num), t.prop('created', t.num), t.prop('blob', t.bin));
