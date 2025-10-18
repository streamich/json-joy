import {ModuleType} from '..';

describe('.toString()', () => {
  test('prints type system with nested refs', () => {
    const system = new ModuleType();
    const {t} = system;
    system.alias('User0', t.Object(t.Key('id', t.str), t.KeyOpt('address', t.Ref('Address'))));
    system.alias('User1', t.Ref('User0'));
    const _user = system.alias('User', t.Ref('User1'));
    system.alias('Address0', t.Object(t.Key('id', t.str), t.KeyOpt('user', t.Ref('User'))));
    system.alias('Address1', t.Ref('Address0'));
    const _address = system.alias('Address', t.Ref('Address1'));
    expect(system.toString()).toMatchInlineSnapshot(`
"Module
└─ aliases
   ├─ User0
   │  └─ obj
   │     ├─ "id"
   │     │   └─ str
   │     └─ "address"?
   │         └─ ref → [Address]
   ├─ User1
   │  └─ ref → [User0]
   ├─ User
   │  └─ ref → [User1]
   ├─ Address0
   │  └─ obj
   │     ├─ "id"
   │     │   └─ str
   │     └─ "user"?
   │         └─ ref → [User]
   ├─ Address1
   │  └─ ref → [Address0]
   └─ Address
      └─ ref → [Address1]"
`);
  });

  test('prints type with nested self reference', () => {
    const system = new ModuleType();
    const {t} = system;
    system.alias('User', t.obj.prop('id', t.str).opt('friend', t.Ref('User')));
    expect(system.toString()).toMatchInlineSnapshot(`
"Module
└─ aliases
   └─ User
      └─ obj
         ├─ "id"
         │   └─ str
         └─ "friend"?
             └─ ref → [User]"
`);
  });
});
