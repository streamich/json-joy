import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {Decoder as JsonDecoder} from '../../json/Decoder';

const json = {
  time: [[1540300689752945, 3]],
  root: {
    type: 'root',
    id: [1540300689752945, 1],
    node: {
      type: 'obj',
      id: [1540300689752945, 2],
      chunks: {
        'Ek=P4T': {
          id: [1540300689752945, 3],
          node: {
            type: 'const',
          },
        },
      },
    },
  },
};

test('can encode and decode specific document', () => {
  const jsonDecoder = new JsonDecoder();
  const decoded1 = jsonDecoder.decode(json as any);
  const encoder = new Encoder();
  const decoder = new Decoder();
  const encoded1 = encoder.encode(decoded1);
  const decoded2 = decoder.decode(encoded1);
  expect(decoded2.toView()).toStrictEqual(decoded1.toView());
});
