import {type ResolveType, t} from '../../../json-type';

export type TStoreBlock = ResolveType<typeof StoreBlock>;
export const StoreBlock = t.Object(
  t.prop('id', t.str),
  t.prop('seq', t.num),
  t.prop('created', t.num),
  t.prop('updated', t.num),
  t.prop('blob', t.bin),
);

export type TStorePatch = ResolveType<typeof StorePatch>;
export const StorePatch = t.Object(t.prop('seq', t.num), t.prop('created', t.num), t.prop('blob', t.bin));
