import {LogicalEncoder} from '../LogicalEncoder';
import {LogicalDecoder} from '../LogicalDecoder';
import {Decoder as JsonDecoder} from '../../json/Decoder';

const json = {
  clock: [
    [1540300689752945, 59],
    [1101525628746448, 71],
    [1598151675765661, 77],
    [7113605048921729, 66],
    [583088168908246, 111],
    [8189115655281685, 166],
    [3453851210509895, 128],
    [8016309938882231, 102],
    [7316603849347436, 212],
  ],
  root: {
    type: 'root',
    id: [1540300689752945, 59],
    node: {
      type: 'arr',
      id: [1540300689752945, 0],
      chunks: [
        {
          id: [3453851210509895, 127],
          nodes: [
            {
              type: 'obj',
              id: [3453851210509895, 106],
              chunks: {
                'Ek=P4T': {
                  id: [7316603849347436, 191],
                  node: {
                    type: 'const',
                    value: 'a',
                  },
                },
              },
            },
          ],
        },
      ],
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
