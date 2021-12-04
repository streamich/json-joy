import {BinaryRequestCompleteMessage} from '../../..';
import { decode } from '../../../../../json-pack/util';
import {Encoder} from '../Encoder';

test('can encode a batch of request messages', () => {
  const encoder = new Encoder();
  const messages = [
    new BinaryRequestCompleteMessage(1, 'a', undefined),
    new BinaryRequestCompleteMessage(2, 'b', undefined),
  ];
  const encoded = encoder.encode(messages);
  const decoded = decode(encoded as any);
  expect(decoded).toStrictEqual([ [ 1, 'a' ], [ 2, 'b' ] ]);
});
