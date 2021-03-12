import {CrdtBlock} from '../CrdtBlock';
import {JsonCrdtBlock, JsonCrdtNodeTypes, JsonCrdtStringNode} from '../types';


describe('.toJson()', () => {
  test('formats to JSON a basic object', () => {
    const crdt: JsonCrdtBlock = {
      node: {
        t: JsonCrdtNodeTypes.Object,
        l: 'id1',
        r: 'id1',
        c: {
          'id1': {
            c: ['foo', {
              t: JsonCrdtNodeTypes.String,
              l: 'id2',
              r: 'id2',
              c: {
                'id2': {
                  c: 'bar',
                }
              }
            }]
          }
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