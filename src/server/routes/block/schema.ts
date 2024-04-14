import {type ResolveType} from '../../../json-type';
import {t} from '../system';

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
  format: 'i32',
});

export type TBlock = ResolveType<typeof Block>;

// prettier-ignore
export const BlockPartial = t.Object(
  t.prop('blob', t.bin),
);

export const BlockPartialReturn = t.Object(
  t.prop('id', t.Ref<typeof BlockId>('BlockId')),
  t.prop('seq', t.Ref<typeof BlockSeq>('BlockSeq')),
  t.prop('created', t.num),
  t.prop('updated', t.num),
);

export const Block = BlockPartial.extend(BlockPartialReturn);

export type TBlockPatch = ResolveType<typeof BlockPatch>;

// prettier-ignore
export const BlockPatchPartial = t.Object(
  t.prop('blob', t.bin).options({
    title: 'Patch Blob',
    description: 'The binary data of the patch. The format of the data is defined by the patch type.',
  }),
);

// prettier-ignore
export const BlockPatchPartialReturn = t.Object(
  t.prop('seq', t.num).options({
    title: 'Patch Sequence Number',
    description: 'The sequence number of the patch in the block. A monotonically increasing integer, starting from 0.',
  }),
  t.prop('created', t.num).options({
    title: 'Patch Creation Time',
    description: 'The time when the patch was created, in milliseconds since the Unix epoch.' +
      '\n\n' + 
      'This time is set by the server when the patch received and stored on the server. If you ' +
      'want to also store the time when the patch was created by the user, you can include this ' +
      'information in the patch blob itself.',
  }),
);

export const BlockPatch = BlockPatchPartial.extend(BlockPatchPartialReturn);
