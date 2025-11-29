import {genShallowReader} from '../shallow-read';
import {MsgPackEncoder} from '../MsgPackEncoder';
import {MsgPackDecoder} from '../MsgPackDecoder';
import type {Path} from '@jsonjoy.com/json-pointer';

const assetShallowRead = (doc: unknown, path: Path): void => {
  const encoder = new MsgPackEncoder();
  const encoded = encoder.encode(doc);
  const decoder = new MsgPackDecoder();
  decoder.reader.reset(encoded);
  const res1 = decoder.find(path).reader.x;
  // console.log(res1);
  const fn = genShallowReader(path);
  // console.log(fn.toString());
  decoder.reader.reset(encoded);
  const res2 = fn(decoder);
  // console.log(res2);
  expect(res1).toBe(res2);
};

describe('genShallowRead', () => {
  test('first-level object', () => {
    const doc = {
      bar: {},
      baz: 123,
      gg: true,
    };
    assetShallowRead(doc, ['bar']);
    assetShallowRead(doc, ['baz']);
    assetShallowRead(doc, ['gg']);
  });

  test('second-level object', () => {
    const doc = {
      a: {
        bar: {},
        baz: 123,
        gg: true,
      },
      b: {
        mmmm: {
          s: true,
        },
      },
      end: null,
    };
    assetShallowRead(doc, ['a']);
    assetShallowRead(doc, ['a', 'bar']);
    assetShallowRead(doc, ['a', 'baz']);
    assetShallowRead(doc, ['a', 'gg']);
    assetShallowRead(doc, ['b', 'mmmm']);
    assetShallowRead(doc, ['b', 'mmmm', 's']);
    assetShallowRead(doc, ['end']);
  });

  test('first-level array', () => {
    const doc = [0];
    assetShallowRead(doc, [0]);
  });

  test('first-level array - 2', () => {
    const doc = [1234, 'asdf', {}, null, false];
    assetShallowRead(doc, [0]);
    assetShallowRead(doc, [1]);
    assetShallowRead(doc, [2]);
    assetShallowRead(doc, [3]);
    assetShallowRead(doc, [4]);
  });

  test('throws when selector is out of bounds of array', () => {
    const doc = [1234, 'asdf', {}, null, false];
    expect(() => assetShallowRead(doc, [5])).toThrow();
  });

  test('can read from complex nested document', () => {
    const doc = {
      a: {
        bar: [
          {
            a: 1,
            2: true,
            asdf: false,
          },
          5,
        ],
        baz: ['a', 'b', 123],
        gg: true,
      },
      b: {
        mmmm: {
          s: true,
        },
      },
      end: null,
    };
    assetShallowRead(doc, ['a']);
    assetShallowRead(doc, ['a', 'bar', 0]);
    assetShallowRead(doc, ['a', 'bar', 1]);
    assetShallowRead(doc, ['a', 'bar', 0, 'a']);
    assetShallowRead(doc, ['a', 'bar', 0, '2']);
    assetShallowRead(doc, ['a', 'bar', 0, 'asdf']);
    assetShallowRead(doc, ['b']);
    assetShallowRead(doc, ['b', 'mmmm']);
    assetShallowRead(doc, ['b', 'mmmm', 's']);
    assetShallowRead(doc, ['end']);
  });

  test('should throw when key does not exist', () => {
    const doc = {
      a: {
        bar: {},
        baz: 123,
        gg: true,
      },
      b: {
        mmmm: {
          s: true,
        },
      },
      end: null,
    };
    const encoder = new MsgPackEncoder();
    const encoded = encoder.encode(doc);
    const decoder = new MsgPackDecoder();
    decoder.reader.reset(encoded);
    const fn = genShallowReader(['asdf']);
    // console.log(fn.toString());
    expect(() => fn(decoder)).toThrow();
  });
});
