import {type ResolveType} from '../../../json-type';
import {t} from '../system';

export const PresenceEntry = t.Object(
  t.prop('id', t.str),
  t.prop('lastSeen', t.num),
  t.prop('validUntil', t.num),
  t.prop(
    'data',
    t.obj.options({
      encodeUnknownFields: true,
    }),
  ),
);

export type TPresenceEntry = ResolveType<typeof PresenceEntry>;
