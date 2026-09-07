/**
 * Declarative descriptors for the scalar/display option fields of each schema
 * `kind`. Child sub-schemas (e.g. `obj.keys`, `arr.type`, `or.types`) are NOT
 * listed here — those are rendered structurally by the per-kind components.
 */
export type FieldControl = 'text' | 'markdown' | 'num' | 'bool' | 'enum' | 'json';

export interface FieldDesc {
  /** Property name on the schema object. */
  key: string;
  /** Human label shown in the options panel. */
  label: string;
  /** Which read-only renderer / (future) input control to use. */
  control: FieldControl;
  /** Allowed values, for `enum` controls. */
  enum?: readonly string[];
  /** When it returns `true`, the field is omitted (e.g. a "none" sentinel value). */
  hide?: (value: unknown) => boolean;
}

export const NUM_FORMATS = ['i', 'u', 'f', 'i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'f32', 'f64'] as const;
export const STR_FORMATS = ['ascii', 'utf8'] as const;
export const BIN_FORMATS = ['json', 'cbor', 'msgpack', 'resp3', 'ion', 'bson', 'ubjson', 'bencode'] as const;

/**
 * Fields common to every kind (via `SchemaBase`/`Display`). `title` is rendered
 * in the node header, so it is intentionally omitted here. `examples` is handled
 * specially by the panel (it is an array of value+display objects).
 */
export const COMMON_FIELDS: FieldDesc[] = [
  {key: 'description', label: 'description', control: 'markdown'},
  {key: 'intro', label: 'intro', control: 'markdown'},
  {key: 'default', label: 'default', control: 'json'},
  {key: 'deprecated', label: 'deprecated', control: 'json'},
  {key: 'meta', label: 'meta', control: 'json'},
  {key: 'metadata', label: 'metadata', control: 'json'},
];

export const KIND_FIELDS: Record<string, FieldDesc[]> = {
  con: [{key: 'value', label: 'value', control: 'json'}],
  num: [
    {key: 'format', label: 'format', control: 'enum', enum: NUM_FORMATS},
    {key: 'gt', label: 'gt', control: 'num'},
    {key: 'gte', label: 'gte', control: 'num'},
    {key: 'lt', label: 'lt', control: 'num'},
    {key: 'lte', label: 'lte', control: 'num'},
  ],
  str: [
    {key: 'format', label: 'format', control: 'enum', enum: STR_FORMATS},
    {key: 'min', label: 'min', control: 'num'},
    {key: 'max', label: 'max', control: 'num'},
    {key: 'noJsonEscape', label: 'noJsonEscape', control: 'bool'},
  ],
  bin: [
    {key: 'format', label: 'format', control: 'enum', enum: BIN_FORMATS},
    {key: 'min', label: 'min', control: 'num'},
    {key: 'max', label: 'max', control: 'num'},
  ],
  arr: [
    {key: 'min', label: 'min', control: 'num'},
    {key: 'max', label: 'max', control: 'num'},
  ],
  obj: [
    {key: 'extends', label: 'extends', control: 'json'},
    {key: 'decodeUnknownKeys', label: 'decodeUnknownKeys', control: 'bool'},
    {key: 'encodeUnknownKeys', label: 'encodeUnknownKeys', control: 'bool'},
  ],
  or: [
    // `['num', -1]` is JSON Type's "no discriminator" sentinel — only show a real one.
    {
      key: 'discriminator',
      label: 'discriminator',
      control: 'json',
      hide: (v) => Array.isArray(v) && v[0] === 'num' && v[1] === -1,
    },
  ],
  ref: [{key: 'ref', label: 'ref', control: 'text'}],
};
