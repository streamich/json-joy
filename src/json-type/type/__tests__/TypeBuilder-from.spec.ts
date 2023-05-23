import {TypeSystem} from '../../system';

const system = new TypeSystem();
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
    ├─ "id":
    │   └─ num
    ├─ "foo":
    │   └─ str
    ├─ "verified":
    │   └─ bool
    ├─ "tags":
    │   └─ arr
    │      └─ str
    ├─ "emptyArr":
    │   └─ arr
    │      └─ any
    ├─ "vectorClockIsTuple":
    │   └─ tup
    │      ├─ str
    │      └─ num
    ├─ "tupleOfObjectsAndArrays":
    │   └─ tup
    │      ├─ arr
    │      │  └─ any
    │      ├─ obj
    │      └─ const → null
    ├─ "nested":
    │   └─ obj
    │      └─ "id":
    │          └─ num
    ├─ "nil":
    │   └─ const → null
    └─ "undef":
        └─ const → undefined"
  `);
});
