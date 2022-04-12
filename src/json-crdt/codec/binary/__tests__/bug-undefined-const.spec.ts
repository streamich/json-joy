import {LogicalEncoder} from '../LogicalEncoder';
import {LogicalDecoder} from '../LogicalDecoder';
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
  const encoder = new LogicalEncoder();
  const decoder = new LogicalDecoder();
  const encoded1 = encoder.encode(decoded1);
  const decoded2 = decoder.decode(encoded1);
  expect(decoded2.toView()).toStrictEqual(decoded1.toView());
});
