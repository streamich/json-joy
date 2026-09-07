import type {Schema} from '@jsonjoy.com/json-type';
import {t} from '@jsonjoy.com/json-type';
import {module as metaschema} from '@jsonjoy.com/json-type/lib/metaschema/metaschema';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import * as React from 'react';
import {ClickableType, type ClickableTypeProps} from '.';

const meta: Meta<typeof ClickableType> = {
  title: 'ClickableType',
  component: ClickableType as any,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

/** A rich object built with the type builder, exercising most kinds. */
const userSchema = t
  .Object(
    t.Key('id', t.String({format: 'ascii', description: 'Unique identifier.'})),
    t.Key('name', t.str.options({title: 'Name', description: 'Display name.'})),
    t.KeyOpt('age', t.num.options({format: 'u8', gte: 0, lte: 150, description: 'Age in years.'})),
    t.Key('role', t.Or(t.Const('admin'), t.Const('user'), t.Const('guest')).options({title: 'Role'})),
    t.KeyOpt('tags', t.Array(t.str).options({title: 'Tags', min: 0, max: 10})),
    t.Key('coords', t.Array(t.num).options({title: 'Coordinates', min: 2, max: 2})),
    t.KeyOpt('avatar', t.Or(t.str, t.nil).options({description: 'Avatar URL or null.'})),
    t.Key('flags', t.Map(t.bool).options({title: 'Feature flags'})),
    t.Key('createdAt', t.num.options({format: 'u64', description: 'Unix ms timestamp.'})),
  )
  .options({
    title: 'User',
    description: 'A user record exercising most JSON Type kinds.',
    default: {id: 'u1', name: 'Ada', role: 'admin', coords: [0, 0], flags: {}, createdAt: 0},
    examples: [
      {
        title: 'Admin user',
        value: {
          id: 'u1',
          name: 'Ada',
          role: 'admin',
          coords: [51.5, -0.12],
          flags: {beta: true},
          createdAt: 1700000000000,
        },
      },
    ],
  })
  .getSchema();

/** A tuple — `arr` with `head`/`tail` — built as a raw schema POJO. */
const tupleSchema: Schema = {
  kind: 'arr',
  title: 'Point Tuple',
  description: 'A `[sid, time, anchor?]` tuple of 2–3 numbers.',
  head: [
    {kind: 'num', title: 'sid'},
    {kind: 'num', title: 'time'},
  ],
  tail: [{kind: 'num', title: 'anchor'}],
} as Schema;

/** An RPC procedure — `fn` with request/response sub-schemas. */
const rpcSchema: Schema = {
  kind: 'fn',
  title: 'getUser',
  description: 'Fetch a user by id.',
  req: {kind: 'obj', keys: [{kind: 'key', key: 'id', value: {kind: 'str', format: 'ascii'}}]},
  res: {kind: 'ref', ref: 'User'},
} as Schema;

/** An object whose **keys** carry their own title/description metadata. */
const annotatedSchema: Schema = {
  kind: 'obj',
  title: 'Article',
  description: 'A blog article. Each **key** is annotated with its own title & description.',
  keys: [
    {
      kind: 'key',
      key: 'slug',
      title: 'URL Slug',
      description: 'Unique, URL-safe identifier used in the article path.',
      value: {kind: 'str', format: 'ascii'},
    },
    {
      kind: 'key',
      key: 'title',
      title: 'Headline',
      description: 'Shown in listings and the `<title>` tag.',
      value: {kind: 'str', min: 1, max: 200},
    },
    {
      kind: 'key',
      key: 'tags',
      optional: true,
      title: 'Tags',
      description: 'Free-form topic labels used for filtering.',
      value: {kind: 'arr', type: {kind: 'str'}},
    },
    {
      kind: 'key',
      key: 'wordCount',
      description: 'Computed length in words (no title on this key).',
      value: {kind: 'num', format: 'u32', gte: 0},
    },
    {
      kind: 'key',
      key: 'author',
      title: 'Author',
      description: 'Reference to the authoring `User`.',
      value: {kind: 'ref', ref: 'User'},
    },
  ],
} as Schema;

/** A type with several examples, each carrying its own title/intro/description. */
const examplesSchema: Schema = {
  kind: 'str',
  title: 'Email',
  description: 'An [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322) email address.',
  format: 'ascii',
  min: 3,
  max: 254,
  examples: [
    {title: 'Typical', description: 'An ordinary personal address.', value: 'ada@example.com'},
    {
      title: 'Subaddressing',
      description: 'Plus-addressing (`+tag`) for inbox filtering.',
      value: 'ada+newsletter@example.com',
    },
    {
      title: 'Internationalized',
      intro: 'Unicode local part and domain.',
      description: 'Requires `SMTPUTF8` support on the server.',
      value: 'находка@пример.рф',
    },
  ],
} as Schema;

/** Homogeneous arrays of various element kinds — element type previews inline. */
const arraysSchema: Schema = {
  kind: 'obj',
  title: 'Arrays',
  description: 'Homogeneous arrays — each element type previews inline as `[ … ]`.',
  keys: [
    {kind: 'key', key: 'strings', value: {kind: 'arr', type: {kind: 'str'}}},
    {
      kind: 'key',
      key: 'ratings',
      value: {kind: 'arr', type: {kind: 'num', format: 'u8', gte: 0, lte: 5}, min: 1, max: 10},
    },
    {kind: 'key', key: 'matrix', value: {kind: 'arr', type: {kind: 'arr', type: {kind: 'num'}}}},
    {
      kind: 'key',
      key: 'users',
      value: {
        kind: 'arr',
        type: {
          kind: 'obj',
          keys: [
            {kind: 'key', key: 'id', value: {kind: 'str', format: 'ascii'}},
            {kind: 'key', key: 'name', value: {kind: 'str'}},
          ],
        },
      },
    },
  ],
} as Schema;

/** Tuples — fixed head, optional rest (`type`), fixed tail. */
const tuplesSchema: Schema = {
  kind: 'obj',
  title: 'Tuples',
  description: 'Fixed-shape arrays built from `head`/`tail` (with an optional middle rest).',
  keys: [
    {
      kind: 'key',
      key: 'point',
      title: 'Point',
      value: {
        kind: 'arr',
        title: 'XY',
        head: [
          {kind: 'num', title: 'x'},
          {kind: 'num', title: 'y'},
        ],
      },
    },
    {
      kind: 'key',
      key: 'rgba',
      value: {
        kind: 'arr',
        head: [
          {kind: 'num', title: 'r'},
          {kind: 'num', title: 'g'},
          {kind: 'num', title: 'b'},
          {kind: 'num', title: 'a'},
        ],
      },
    },
    {
      kind: 'key',
      key: 'row',
      description: 'A name, any number of numeric cells, then an `active` flag.',
      value: {
        kind: 'arr',
        head: [{kind: 'str', title: 'name'}],
        type: {kind: 'num'},
        tail: [{kind: 'bool', title: 'active'}],
      },
    },
  ],
} as Schema;

/** Minimal — bare kinds, no metadata whatsoever. */
const minimalSchema: Schema = {
  kind: 'obj',
  keys: [
    {kind: 'key', key: 'str', value: {kind: 'str'}},
    {kind: 'key', key: 'num', value: {kind: 'num'}},
    {kind: 'key', key: 'bool', value: {kind: 'bool'}},
    {kind: 'key', key: 'arr', value: {kind: 'arr', type: {kind: 'str'}}},
    {kind: 'key', key: 'map', value: {kind: 'map', value: {kind: 'num'}}},
    {kind: 'key', key: 'const', value: {kind: 'con', value: 42}},
    {kind: 'key', key: 'any', optional: true, value: {kind: 'any'}},
  ],
} as Schema;

/** Maximal — every metadata field: titles, descriptions, defaults, examples, formats, validations. */
const maximalSchema: Schema = {
  kind: 'obj',
  title: 'Account',
  intro: 'A fully-annotated type.',
  description: 'An **account** record demonstrating *every* metadata field — see the `examples` below.',
  decodeUnknownKeys: false,
  encodeUnknownKeys: false,
  deprecated: {info: 'Prefer `AccountV2`.'},
  meta: {table: 'accounts'},
  metadata: {team: 'identity'},
  default: {id: 'acc_0', balance: 0, status: 'active'},
  examples: [
    {
      title: 'New account',
      intro: 'Freshly created.',
      description: 'Zero balance, `active` status.',
      value: {id: 'acc_1a2b', balance: 0, status: 'active'},
    },
    {
      title: 'Suspended',
      description: 'Over-limit and frozen, with a risk tag.',
      value: {id: 'acc_9z8y', balance: -5000, status: 'suspended', tags: ['risk']},
    },
  ],
  keys: [
    {
      kind: 'key',
      key: 'id',
      title: 'Account ID',
      description: 'Stable, public, URL-safe identifier.',
      value: {
        kind: 'str',
        format: 'ascii',
        min: 3,
        max: 64,
        noJsonEscape: true,
        default: 'acc_0',
        examples: [{title: 'Typical', value: 'acc_1a2b3c'}],
      },
    },
    {
      kind: 'key',
      key: 'balance',
      title: 'Balance',
      description: 'Signed minor units (cents).',
      value: {kind: 'num', format: 'i64', gte: -1000000, lte: 1000000000, default: 0},
    },
    {
      kind: 'key',
      key: 'score',
      title: 'Risk score',
      description: 'Open interval `(0, 1)`.',
      value: {kind: 'num', format: 'f64', gt: 0, lt: 1},
    },
    {
      kind: 'key',
      key: 'tags',
      optional: true,
      title: 'Tags',
      description: 'Up to 16 free-form labels.',
      value: {kind: 'arr', type: {kind: 'str', min: 1, max: 32}, min: 0, max: 16, default: []},
    },
    {
      kind: 'key',
      key: 'status',
      title: 'Status',
      description: 'Lifecycle state.',
      value: t.Or(t.Const('active'), t.Const('suspended'), t.Const('closed')).options({default: 'active'}).getSchema(),
    },
    {
      kind: 'key',
      key: 'avatar',
      optional: true,
      title: 'Avatar',
      description: 'Raw image bytes, CBOR-framed.',
      value: {kind: 'bin', format: 'cbor', min: 0, max: 1048576, type: {kind: 'any'}},
    },
  ],
} as Schema;

/** Keys AND their value types each carry their own (distinct) descriptions. */
const keyVsValueDocsSchema: Schema = {
  kind: 'obj',
  title: 'Settings',
  description: 'Every key has its own description, separate from its value type’s description.',
  keys: [
    {
      kind: 'key',
      key: 'theme',
      description: 'Which palette the UI uses; stored per-user.',
      value: {kind: 'str', description: 'A CSS color-scheme name.', default: 'system'},
    },
    {
      kind: 'key',
      key: 'retries',
      description: 'How many times a failed request is retried.',
      value: {kind: 'num', format: 'u8', gte: 0, lte: 10, description: 'A small unsigned count.'},
    },
    {
      kind: 'key',
      key: 'tags',
      optional: true,
      description: 'Optional labels attached to this record.',
      value: {
        kind: 'arr',
        description: 'The list of tags on the record.',
        type: {kind: 'str', min: 1, description: 'A single non-empty tag.'},
      },
    },
  ],
} as Schema;

const Frame: React.FC<ClickableTypeProps> = (props) => (
  <div style={{padding: '32px 64px', minWidth: 480, boxSizing: 'border-box'}}>
    <ClickableType {...props} />
  </div>
);

type Story = StoryObj<typeof meta>;

export const User: Story = {render: () => <Frame type={userSchema} />};

export const Tuple: Story = {render: () => <Frame type={tupleSchema} />};

export const Rpc: Story = {render: () => <Frame type={rpcSchema} />};

/** The JSON Type metaschema — the schema that describes schemas. */
export const Metaschema: Story = {render: () => <Frame type={metaschema} />};

/** First-level-only view: the root and its immediate fields, everything deeper collapsed. */
export const Collapsed: Story = {render: () => <Frame type={userSchema} collapsed />};

/** Two levels expanded; deeper nesting collapsed. */
export const ExpandTwoLevels: Story = {render: () => <Frame type={userSchema} expand={2} />};

/** The (deep) metaschema, collapsed to its top-level type aliases. */
export const MetaschemaCollapsed: Story = {render: () => <Frame type={metaschema} collapsed />};

/** Object keys annotated with their own title/description metadata. */
export const AnnotatedKeys: Story = {render: () => <Frame type={annotatedSchema} />};

/** Keys and their value types each carry their own distinct descriptions. */
export const KeyVsValueDescriptions: Story = {render: () => <Frame type={keyVsValueDocsSchema} />};

/** A type with multiple examples, each with title/intro/description metadata. */
export const MultipleExamples: Story = {render: () => <Frame type={examplesSchema} />};

/** Homogeneous arrays — element types preview inline. */
export const Arrays: Story = {render: () => <Frame type={arraysSchema} />};

/** Homogeneous arrays, collapsed — shows the `[ <type> ]` inline previews. */
export const ArraysCollapsed: Story = {render: () => <Frame type={arraysSchema} expand={1} />};

/** Tuples — head/rest/tail with the collapsible "elements" section. */
export const Tuples: Story = {render: () => <Frame type={tuplesSchema} />};

/** Minimal — bare kinds, no metadata. */
export const Minimal: Story = {render: () => <Frame type={minimalSchema} />};

/** Maximal — every metadata field populated. */
export const Maximal: Story = {render: () => <Frame type={maximalSchema} />};

/**
 * **Isolation (uncontrolled).** Double-click any node — or open its toolbar (the
 * chevron that appears on hover) and pick **Isolate** — to collapse the view
 * down to just that node, rendered as a fresh root with a breadcrumb trail back
 * to the top on the first line. Click an ancestor breadcrumb to isolate it;
 * click the root crumb to restore the full tree. No props needed — the isolated
 * path is tracked internally.
 */
export const Isolation: Story = {render: () => <Frame type={userSchema} />};

/** Quick-isolate targets for the controlled story (JSON Pointers into {@link userSchema}). */
const QUICK_ISOLATIONS: {label: string; pointer: string | null}[] = [
  {label: 'Whole tree', pointer: null},
  {label: 'coords (key)', pointer: '/keys/5'},
  {label: 'coords → array', pointer: '/keys/5/value'},
  {label: 'role (or)', pointer: '/keys/3/value'},
  {label: 'flags (map)', pointer: '/keys/7/value'},
];

const buttonStyle = (active: boolean): React.CSSProperties => ({
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid #8884',
  background: active ? '#2a7fff22' : 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: 12,
});

const ControlledIsolation: React.FC = () => {
  const [isolation, setIsolation] = React.useState<string | null>('/keys/5/value');
  return (
    <div style={{padding: '32px 64px', minWidth: 520, boxSizing: 'border-box'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24}}>
        {QUICK_ISOLATIONS.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => setIsolation(q.pointer)}
            style={buttonStyle(isolation === q.pointer)}
          >
            {q.label}
          </button>
        ))}
      </div>
      <ClickableType type={userSchema} isolation={isolation} onIsolation={setIsolation} />
      <pre style={{marginTop: 24, fontSize: 12, opacity: 0.6}}>isolation = {JSON.stringify(isolation)}</pre>
    </div>
  );
};

/**
 * **Isolation (controlled).** The isolated pointer lives in the parent and is
 * fed back through the `isolation` prop, with `onIsolation` storing the next
 * value. So the in-tree gestures (double-click, the **Isolate** toolbar action,
 * breadcrumb clicks) and the external buttons all drive the *same* state — and
 * the live pointer is echoed underneath.
 */
export const IsolationControlled: Story = {render: () => <ControlledIsolation />};

/** A {@link Frame} that starts isolated at `initial` but stays interactive (own state). */
const IsolatableFrame: React.FC<ClickableTypeProps & {initial?: string | null}> = ({initial = null, ...props}) => {
  const [isolation, setIsolation] = React.useState<string | null>(initial);
  return (
    <div style={{padding: '32px 64px', minWidth: 480, boxSizing: 'border-box'}}>
      <ClickableType {...props} isolation={isolation} onIsolation={setIsolation} />
    </div>
  );
};

/** Isolation works on any schema — here the deep metaschema, opened isolated to its first type. */
export const IsolationMetaschema: Story = {render: () => <IsolatableFrame type={metaschema} initial="/keys/0" />};
