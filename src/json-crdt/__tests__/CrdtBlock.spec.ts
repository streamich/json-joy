import {CrdtBlock} from '../CrdtBlock';

describe('CrdtBlock', () => {
  test('can start a new block', () => {
    const block = new CrdtBlock();
    expect(block.toJson()).toEqual({});
  });

  test('can add a number key to a block', () => {
    const block = new CrdtBlock();
    block.insertObjectKey('', 'foo', 123);
    expect(block.toJson()).toEqual({foo: 123});
  });

  test('can add a string key to a block', () => {
    const block = new CrdtBlock();
    block.insertObjectKey('', 'foo', 'hello there!');
    expect(block.toJson()).toEqual({foo: 'hello there!'});
  });

  test('can add multiple keys', () => {
    const block = new CrdtBlock();
    block.insertObjectKey('', 'a', false);
    block.insertObjectKey('', 'b', null);
    block.insertObjectKey('', 'c', true);
    block.insertObjectKey('', 'd', 1.23);
    block.insertObjectKey('', 'e', 'asdf');
    expect(block.toJson()).toEqual({
      a: false,
      b: null,
      c: true,
      d: 1.23,
      e: 'asdf',
    });
  });

  test('can add array key', () => {
    const block = new CrdtBlock();
    block.insertObjectKey('', 'a', []);
    expect(block.toJson()).toEqual({
      a: [],
    });
  });

  test('can add array key with one element', () => {
    const block = new CrdtBlock();
    block.insertObjectKey('', 'a', [1]);
    expect(block.toJson()).toEqual({
      a: [1],
    });
  });

  test('can add array key with two element', () => {
    const block = new CrdtBlock();
    block.insertObjectKey('', 'a', [1, 2]);
    expect(block.toJson()).toEqual({
      a: [1, 2],
    });
  });

  test('can add array key with tree element', () => {
    const block = new CrdtBlock();
    block.insertObjectKey('', 'a', [1, 2, true]);
    expect(block.toJson()).toEqual({
      a: [1, 2, true],
    });
  });

  test('can add array with a string', () => {
    const block = new CrdtBlock();
    block.insertObjectKey('', 'a', [1, '2', true]);
    block.insertObjectKey('', 'b', [null, '2', 'adsf']);
    block.insertObjectKey('', 'c', []);
    block.insertObjectKey('', 'c', ['asdf']);
    console.log(block.toJson())
    console.log(JSON.stringify(block.toJson()).length)
    console.log(block)
    console.log(JSON.stringify(block.refs).length);
    expect(block.toJson()).toEqual({
      a: [1, '2', true],
      b: [null, '2', 'adsf'],
      c: ['asdf'],
    });
  });
});

// describe('.toJson()', () => {
//   test('encodes a null', () => {
//     expect(toJson(null)).toBe(null);
//   });

//   test('encodes booleans', () => {
//     expect(toJson(true)).toBe(true);
//     expect(toJson(false)).toBe(false);
//   });

//   test('encodes numbers', () => {
//     expect(toJson(0)).toBe(0);
//     expect(toJson(1)).toBe(1);
//     expect(toJson(-2)).toBe(-2);
//     expect(toJson(1.123)).toBe(1.123);
//   });

//   describe('strings', () => {
//     test('encodes an empty string', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.String,
//         l: '',
//         r: '',
//         c: {}
//       };
//       expect(toJson(node)).toBe('');
//     });

//     test('encodes a single chunk string', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.String,
//         l: 'xyz',
//         r: 'xyz',
//         c: {
//           'xyz': {
//             c: 'hello',
//           }
//         }
//       };
//       expect(toJson(node)).toBe('hello');
//     });
  
//     test('encodes a two chunk string', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.String,
//         l: 'a',
//         r: 'a',
//         c: {
//           'b': {
//             l0: 'a',
//             l1: 'a',
//             c: 'ma!',
//           },
//           'a': {
//             r0: 'b',
//             r1: 'b',
//             c: 'Ma',
//           },
//         }
//       };
//       expect(toJson(node)).toBe('Mama!');
//     });
  
//     test('encodes a three chunk string', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.String,
//         l: 'a',
//         r: 'a',
//         c: {
//           'b': {
//             l0: 'a',
//             l1: 'a',
//             r0: 'c',
//             r1: 'c',
//             c: 'ma!',
//           },
//           'c': {
//             l0: 'b',
//             l1: 'b',
//             c: ' Mia!',
//           },
//           'a': {
//             r0: 'b',
//             r1: 'b',
//             c: 'Ma',
//           },
//         }
//       };
//       expect(toJson(node)).toBe('Mama! Mia!');
//     });
//   });

//   describe('array', () => {
//     test('empty array', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.Array,
//         l: '',
//         r: '',
//         c: {}
//       };
//       expect(toJson(node)).toEqual([]);
//     });

//     test('encodes a single chunk array', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.Array,
//         l: 'xyz',
//         r: 'xyz',
//         c: {
//           'xyz': {
//             c: 123,
//           }
//         }
//       };
//       expect(toJson(node)).toEqual([123]);
//     });

//     test('encodes a two chunk array', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.Array,
//         l: 'a',
//         r: 'a',
//         c: {
//           'a': {
//             r0: 'b',
//             r1: 'b',
//             c: 123,
//           },
//           'b': {
//             l0: 'a',
//             l1: 'a',
//             c: true,
//           }
//         }
//       };
//       expect(toJson(node)).toEqual([123, true]);
//     });

//     test('encodes a three chunk array with a complex type', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.Array,
//         l: 'a',
//         r: 'a',
//         c: {
//           'a': {
//             r0: 'b',
//             r1: 'b',
//             c: 123,
//           },
//           'b': {
//             l0: 'a',
//             l1: 'a',
//             r0: 'c',
//             r1: 'c',
//             c: null,
//           },
//           'c': {
//             l0: 'b',
//             l1: 'b',
//             c: {
//               t: JsonCrdtNodeTypes.Array,
//               l: '',
//               r: '',
//               c: {}
//             },
//           },
//         }
//       };
//       expect(toJson(node)).toEqual([123, null, []]);
//     });
//   });

//   describe('object', () => {
//     test('formats to JSON a basic object', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.Object,
//         l: 'id1',
//         r: 'id1',
//         c: {
//           'id1': {
//             c: ['foo', {
//               t: JsonCrdtNodeTypes.String,
//               l: 'id2',
//               r: 'id2',
//               c: {
//                 'id2': {
//                   c: 'bar',
//                 }
//               }
//             }]
//           }
//         },
//       };
//       const json = toJson(node);
//       expect(json).toEqual({
//         foo: 'bar',
//       });
//     });

//     test('nested object', () => {
//       const node: JsonCrdtNode = {
//         t: JsonCrdtNodeTypes.Object,
//         l: 'a',
//         r: '',
//         c: {
//           'a': {
//             r0: 'b',
//             r1: 'b',
//             c: ['foo', {
//               t: JsonCrdtNodeTypes.String,
//               l: 'id2',
//               r: 'id2',
//               c: {
//                 'id2': {
//                   c: 'bar',
//                 }
//               }
//             }]
//           },
//           'b': {
//             l0: 'a',
//             l1: 'a',
//             r0: 'c',
//             r1: 'c',
//             c: ['a', true],
//           },
//           'c': {
//             l0: 'b',
//             l1: 'b',
//             c: ['aha', {
//               t: JsonCrdtNodeTypes.Object,
//               l: '',
//               r: '',
//               c: {},
//             }],
//           },
//         },
//       };
//       const json = toJson(node);
//       expect(json).toEqual({
//         foo: 'bar',
//         a: true,
//         aha: {},
//       });
//     });
//   });
// });