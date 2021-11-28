import {t} from '../../json-type';
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
