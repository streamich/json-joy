import {ModuleType} from '../../type/classes/ModuleType';

const system = new ModuleType();
const t = system.t;

test('can create a schema for a deeply nested object', () => {
  const type = t.from({
    id: 123,
    foo: 'bar',
    verified: true,
    tags: ['a', 'b', 'c'],
    emptyArr: [],
    vectorClockIsTuple: ['site 1', 123],
    tupleOfObjectsAndArrays: [[], {}, null],
    nested: {
      id: 456,
    },
    nil: null,
    undef: undefined,
  });
  expect(type + '').toMatchInlineSnapshot(`
"obj
├─ "id"
│   └─ num
├─ "foo"
│   └─ str
├─ "verified"
│   └─ bool
├─ "tags"
│   └─ arr
│      └─ str
├─ "emptyArr"
│   └─ arr
│      └─ any
├─ "vectorClockIsTuple"
│   └─ arr
│      └─ [ head, ... ]
│         ├─ str
│         └─ num
├─ "tupleOfObjectsAndArrays"
│   └─ arr
│      └─ [ head, ... ]
│         ├─ arr
│         │  └─ any
│         ├─ obj
│         └─ con → null
├─ "nested"
│   └─ obj
│      └─ "id"
│          └─ num
├─ "nil"
│   └─ con → null
└─ "undef"
    └─ con → undefined"
`);
});
