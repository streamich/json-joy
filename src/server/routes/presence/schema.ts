import {type ResolveType, t} from "../../../json-type";

export const PresenceEntry = t.Object(
  t.prop('id', t.str),
  t.prop('lastSeen', t.num),
  t.prop('validUntil', t.num),
  t.prop('data', t.obj),
);

export type TPresenceEntry = ResolveType<typeof PresenceEntry>;
