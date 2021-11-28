import {t} from '../../json-type';
import {BooleanValidator} from '../../json-type-validator';
import {JsonTypeSystem} from '../JsonTypeSystem';

const types = {
  'db.ApplyPatchRequest': t.Object([
    t.Field('id', t.Ref('ID')),
    t.Field('v', t.num),
  ]),

  'ID': t.String({
    title: 'ID',
    description: 'ID of a document.',
  }),

  'User': t.Object([
    t.Field('id', t.str),
    t.Field('name', t.str),
    t.Field('partner', t.Ref('User'), {isOptional: true}),
    t.Field('address', t.Ref('Address'), {isOptional: true}),
  ]),

  'Address': t.Object([
    t.Field('street', t.str),
    t.Field('zip', t.str),
    t.Field('owner', t.Ref('User'), {isOptional: true}),
  ]),
};

test('can create validators with reference', () => {
  const system = new JsonTypeSystem({
    types,
  });
  const idValidator = system.getFastValidator('ID');
  const applyPatchRequestValidator = system.getFastValidator('db.ApplyPatchRequest');
  expect(idValidator('123')).toBe(false);
  expect(applyPatchRequestValidator({
    id: 'adsf',
    v: 1,
  })).toBe(false);
});

test('can create validators with reference (reverse order)', () => {
  const system = new JsonTypeSystem({
    types,
  });
  const applyPatchRequestValidator = system.getFastValidator('db.ApplyPatchRequest');
  const idValidator = system.getFastValidator('ID');
  expect(idValidator('123')).toBe(false);
  expect(applyPatchRequestValidator({
    id: 'adsf',
    v: 1,
  })).toBe(false);
});

test('can resolve own recursive refs', () => {
  const system = new JsonTypeSystem({
    types,
  });
  const userValidator = system.getFastValidator('User');
  const result1 = userValidator({
    id: '123',
    name: 'John',
  });
  const result2 = userValidator({
    id: '123',
    name: 'John',
    partner: {},
  });
  const result3 = userValidator({
    id: '123',
    name: 'John',
    partner: {
      id: '124',
      name: 'Jane',
    },
  });
  expect(result1).toBe(false);
  expect(result2).toBe(true);
  expect(result3).toBe(false);
});

const assertUserAndAddress = (userValidator: BooleanValidator, addressValidator: BooleanValidator) => {
  const result1 = userValidator({
    id: '123',
    name: 'John',
    address: {},
  });
  const result2 = userValidator({
    id: '123',
    name: 'John',
    address: {
      street: '123',
      zip: '123',
    },
  });
  const result3 = addressValidator({
    street: '123',
  });
  const result4 = addressValidator({
    street: '123',
    zip: '123',
  });
  const result5 = addressValidator({
    street: '123',
    zip: '123',
    owner: {},
  });
  const result6 = addressValidator({
    street: '123',
    zip: '123',
    owner: {
      id: '1',
      name: 'Lol',
    },
  });
  const result7 = userValidator({
    id: '123',
    name: 'John',
    address: {
      street: '123',
      zip: '123',
      owner: {

      },
    },
  });
  const result8 = userValidator({
    id: '123',
    name: 'John',
    address: {
      street: '123',
      zip: '123',
      owner: {
        id: '1',
        name: 'Lol',
      },
    },
  });
  expect(result1).toBe(true);
  expect(result2).toBe(false);
  expect(result3).toBe(true);
  expect(result4).toBe(false);
  expect(result5).toBe(true);
  expect(result6).toBe(false);
  expect(result7).toBe(true);
  expect(result8).toBe(false);
};

test('can resolve two types reffing each other', () => {
  const system = new JsonTypeSystem({
    types,
  });
  const userValidator = system.getFastValidator('User');
  const addressValidator = system.getFastValidator('Address');
  assertUserAndAddress(userValidator, addressValidator);
});

test('can resolve two types reffing each other (in reverse)', () => {
  const system = new JsonTypeSystem({
    types,
  });
  const addressValidator = system.getFastValidator('Address');
  const userValidator = system.getFastValidator('User');
  assertUserAndAddress(userValidator, addressValidator);
});
