import {TypeSystem} from '../TypeSystem';

describe('.toString()', () => {
  test('prints type system with nested refs', () => {
    const system = new TypeSystem();
    const {t} = system;
    system.alias('User0', t.Object(t.prop('id', t.str), t.propOpt('address', t.Ref('Address'))));
    system.alias('User1', t.Ref('User0'));
    const user = system.alias('User', t.Ref('User1'));
    system.alias('Address0', t.Object(t.prop('id', t.str), t.propOpt('user', t.Ref('User'))));
    system.alias('Address1', t.Ref('Address0'));
    const address = system.alias('Address', t.Ref('Address1'));
    system.addCustomValidator({
      name: 'empty-string',
      fn: (value: string) => {
        if (!value) throw new Error('empty string');
      },
    });
    expect(system.toString()).toMatchInlineSnapshot(`
"TypeSystem
├─ aliases
│  ├─ User0
│  │  └─ obj
│  │     ├─ "id":
│  │     │   └─ str
│  │     └─ "address"?:
│  │         └─ ref → [Address]
│  ├─ User1
│  │  └─ ref → [User0]
│  ├─ User
│  │  └─ ref → [User1]
│  ├─ Address0
│  │  └─ obj
│  │     ├─ "id":
│  │     │   └─ str
│  │     └─ "user"?:
│  │         └─ ref → [User]
│  ├─ Address1
│  │  └─ ref → [Address0]
│  └─ Address
│     └─ ref → [Address1]
│
└─ validators
   └─ "empty-string""
`);
  });
});
