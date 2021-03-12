import {CrdtBlock} from '../CrdtBlock';
import {JsonCrdtBlock, JsonCrdtNodeTypes, JsonCrdtStringNode} from '../types';


describe('.toJson()', () => {
  test('formats to JSON a basic object', () => {
    const crdt: JsonCrdtBlock = {
      node: {
        t: JsonCrdtNodeTypes.Object,
        l: 'id1',
        r: 'id1',
        chunks: {
          'id1': {
            key: 'foo',
            val: {
              t: JsonCrdtNodeTypes.String,
              l: 'id2',
              r: 'id2',
              chunks: {
                'id2': {
                  val: 'bar',
                },
              },
            },
          },
        },
      },
    };
    const block = new CrdtBlock(crdt);
    const json = block.toJson();

    expect(json).toEqual({
      foo: 'bar',
    });
  });
});