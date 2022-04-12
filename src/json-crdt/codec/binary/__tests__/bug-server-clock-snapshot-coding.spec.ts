import {Decoder as JsonDecoder} from '../../json/Decoder';
import {Encoder as BinaryEncoder} from '../Encoder';
import {Decoder as BinaryDecoder} from '../Decoder';

const jsonDecoder = new JsonDecoder();
const binaryEncoder = new BinaryEncoder();
const binaryDecoder = new BinaryDecoder();

const encoded1 = {
  time: 55,
  root: {
    type: 'root',
    id: 43,
    node: {
      type: 'obj',
      id: 0,
      chunks: {
        '@type': {id: 40, node: {type: 'str', id: 1, chunks: [{id: 2, value: 'CreativeWork'}]}},
        name: {
          id: 41,
          node: {
            type: 'str',
            id: 14,
            chunks: [
              {id: 45, value: 'My t'},
              {id: 15, span: 1},
              {id: 16, value: 'ask'},
              {id: 54, value: 's'},
              {id: 19, span: 5},
            ],
          },
        },
        description: {id: 42, node: {type: 'str', id: 24, chunks: [{id: 25, value: 'A list of tasks'}]}},
      },
    },
  },
};

test('bug: decodes into UNKNOWN_OP error', () => {
  const decoded1 = jsonDecoder.decode(encoded1 as any);
  // console.log(decoded1.toString());
  const encoded2 = binaryEncoder.encode(decoded1);
  // console.log(encoded2);
  const decoded2 = binaryDecoder.decode(encoded2);
  // console.log(decoded2.toString());
  expect(decoded2.toString()).toBe(decoded1.toString());
  expect(decoded2.toView()).toStrictEqual(decoded1.toView());
});
