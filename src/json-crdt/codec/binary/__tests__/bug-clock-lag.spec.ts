import {LogicalEncoder} from '../LogicalEncoder';
import {LogicalDecoder} from '../LogicalDecoder';
import {Decoder as JsonDecoder} from '../../json/Decoder';

const json = {
  time: [
    [111, 17],
    [222, 45],
  ],
  root: {
    type: 'root',
    id: [111, 17],
    node: {
      type: 'obj',
      id: [222, 19],
      chunks: {
        x: {
          id: [222, 24],
          node: {
            type: 'str',
            id: [222, 20],
            chunks: [
              {
                id: [222, 54],
                value: 'a',
              },
            ],
          },
        },
        y: {
          id: [222, 26],
          node: {
            type: 'val',
            id: [222, 23],
            writeId: [222, 43],
            value: 123,
          },
        },
      },
    },
  },
};

test('can encode and decode a document when clock is behind operation IDs clock: [222, 45], string chunk: [222, 54]', () => {
  const jsonDecoder = new JsonDecoder();
  const decoded1 = jsonDecoder.decode(json as any);
  const encoder = new LogicalEncoder();
  const decoder = new LogicalDecoder();
  const encoded1 = encoder.encode(decoded1);
  const decoded2 = decoder.decode(encoded1);
  expect(decoded2.toView()).toStrictEqual(decoded1.toView());
});
