import {JsonRequestCompleteMessage} from '../../../messages/json';
import {Encoder} from '../Encoder';

test('encodes a single message when there is one message in the batch', () => {
  const encoder = new Encoder();
  const messages = [
    new JsonRequestCompleteMessage(1, 'a', undefined),
  ];
  const encoded = encoder.encode(messages);
  const decoded = JSON.parse(encoded as any);
  expect(decoded).toStrictEqual([ 1, 'a' ]);
});

test('can encode a batch of request messages', () => {
  const encoder = new Encoder();
  const messages = [
    new JsonRequestCompleteMessage(1, 'a', undefined),
    new JsonRequestCompleteMessage(2, 'b', undefined),
  ];
  const encoded = encoder.encode(messages);
  const decoded = JSON.parse(encoded as any);
  expect(decoded).toStrictEqual([ [ 1, 'a' ], [ 2, 'b' ] ]);
});
