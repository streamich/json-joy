import {t} from '..';
import {parse} from '../../../json-binary';
import {TypeSystem} from '../../system/TypeSystem';
import {everyType, everyTypeValue} from './fixtures';

test('can serialize an object', () => {
  const type = t.Object(
    t.prop('id', t.str.options({validator: ['id', 'uuid']})).options({
      description: 'The id of the object',
    }),
    t.prop('tags', t.Array(t.str).options({title: 'Tags'})).options({title: 'Always use tags'}),
  );
  const value = {
    id: 'string',
    tags: ['string', 'string 2'],
  };
  expect(type.toJson(value)).toBe('{"id":"string","tags":["string","string 2"]}');
});

test('can serialize string with emojis', () => {
  const type = t.Object(t.prop('👋', t.str));
  const value = {
    '👋': '😇',
  };
  expect(type.toJson(value)).toBe('{"👋":"😇"}');
});

test('can serialize every type', () => {
  const json = everyType.toJson(everyTypeValue);
  const decoded = parse(json);
  (decoded as any).undef = undefined;
  expect(decoded).toStrictEqual(everyTypeValue);
});

test('can serialize with ref', () => {
  const system = new TypeSystem();
  system.alias('User', t.Object(t.prop('id', t.str), t.prop('name', t.str)));
  const type = t.Object(t.prop('user', t.Ref('User')));
  const value = {
    user: {
      id: '!id',
      name: '!name',
    },
  };
  const json1 = type.toJson(value);
  const json2 = type.toJson(value, system);
  expect(json1).toBe('{"user":null}');
  expect(json2).toBe('{"user":{"id":"!id","name":"!name"}}');
});
