import {JsonDecoderPartial} from '../JsonDecoderPartial';

const decoder = new JsonDecoderPartial();
const parse = (text: string) => {
  const data = Buffer.from(text, 'utf-8');
  decoder.reader.reset(data);
  const value = decoder.readAny();
  return value;
};

describe('array', () => {
  test('can parse valid array', () => {
    const value = parse('[1, 2, 3]');
    expect(value).toEqual([1, 2, 3]);
  });

  test('can parse array with missing closing brace', () => {
    const value = parse('[1, 2, 3 ');
    expect(value).toEqual([1, 2, 3]);
  });

  test('can parse array with missing closing brace - 2', () => {
    const value = parse('[1, 2, 3');
    expect(value).toEqual([1, 2, 3]);
  });

  test('can parse array with trailing comma', () => {
    const value = parse('[1, 2, ');
    expect(value).toEqual([1, 2]);
  });

  test('can parse array with trailing comma - 2', () => {
    const value = parse('[1, 2,');
    expect(value).toEqual([1, 2]);
  });

  test('can parse array with two trailing commas', () => {
    const value = parse('[true, "asdf",,');
    expect(value).toEqual([true, 'asdf']);
  });

  test.skip('can parse array with double commas', () => {
    const value = parse('[true, "asdf",, 4]');
    expect(value).toEqual([true, 'asdf', 4]);
  });

  test.skip('can parse array with triple commas', () => {
    const value = parse('[true, "asdf",, , 4]');
    expect(value).toEqual([true, 'asdf', 4]);
  });

  test('can parse nested arrays', () => {
    const value = parse('[[true, false, null]]');
    expect(value).toEqual([[true, false, null]]);
  });

  test('can parse nested arrays with missing brace', () => {
    const value = parse('[[true, false, null]');
    expect(value).toEqual([[true, false, null]]);
  });

  test('can parse nested arrays with two missing braces', () => {
    const value = parse('[[true, false, null');
    expect(value).toEqual([[true, false, null]]);
  });

  test('can parse nested arrays with two missing element', () => {
    const value = parse('[[true, false,');
    expect(value).toEqual([[true, false]]);
  });
});

describe('object', () => {
  test('can parse valid object', () => {
    const value = parse('{"foo": 1, "bar": 2}');
    expect(value).toEqual({foo: 1, bar: 2});
  });

  test('can parse object with missing brace (trailing space)', () => {
    const value = parse('{"foo": 1, "bar": 2 ');
    expect(value).toEqual({foo: 1, bar: 2});
  });

  test('can parse object with missing brace', () => {
    const value = parse('{"foo": 1, "bar": 2');
    expect(value).toEqual({foo: 1, bar: 2});
  });

  test('can parse object with missing field value', () => {
    const value1 = parse('{"foo": 1, "bar": ');
    const value2 = parse('{"foo": 1, "bar":');
    const value3 = parse('{"foo": 1, "bar"');
    const value4 = parse('{"foo": 1, "bar');
    const value5 = parse('{"foo": 1, "b');
    const value6 = parse('{"foo": 1, "');
    const value7 = parse('{"foo": 1, ');
    const value8 = parse('{"foo": 1,');
    const value9 = parse('{"foo": 1');
    expect(value1).toEqual({foo: 1});
    expect(value2).toEqual({foo: 1});
    expect(value3).toEqual({foo: 1});
    expect(value4).toEqual({foo: 1});
    expect(value5).toEqual({foo: 1});
    expect(value6).toEqual({foo: 1});
    expect(value7).toEqual({foo: 1});
    expect(value8).toEqual({foo: 1});
    expect(value9).toEqual({foo: 1});
  });

  test('can parse nested object', () => {
    const value1 = parse('{"a": {"foo": 1, "bar": 2}}');
    const value2 = parse('{"a": {"foo": 1, "bar": 2} }');
    const value3 = parse('{"a": {"foo": 1, "bar": 2} ');
    const value4 = parse('{"a": {"foo": 1, "bar": 2}');
    const value5 = parse('{"a": {"foo": 1, "bar": 2 ');
    const value6 = parse('{"a": {"foo": 1, "bar": 2');
    expect(value1).toEqual({a: {foo: 1, bar: 2}});
    expect(value2).toEqual({a: {foo: 1, bar: 2}});
    expect(value3).toEqual({a: {foo: 1, bar: 2}});
    expect(value4).toEqual({a: {foo: 1, bar: 2}});
    expect(value5).toEqual({a: {foo: 1, bar: 2}});
    expect(value6).toEqual({a: {foo: 1, bar: 2}});
  });
});

test('simple nested object', () => {
  const value = parse('{ "name": { "first": "ind", "last": "go');
  expect(value).toEqual({name: {first: 'ind'}});
});

test('example output from LLM', () => {
  const value = parse(`
{
    "name": "Alice",
    "age": 25,
    "hobbies": ["eat", "drink"
    "is_student": false
Some extra text after the JSON with missing closing brace.`);
  expect(value).toEqual({
    name: 'Alice',
    age: 25,
    hobbies: ['eat', 'drink'],
    is_student: false,
  });
});
