import {compactMessages} from '../../compact/__tests__/compact-messages';
import {decode} from '../../compact/decode';
import {Message, ReactiveRpcMessage, RequestCompleteMessage, RequestDataMessage, RequestErrorMessage, RequestUnsubscribeMessage, ResponseCompleteMessage, ResponseDataMessage, ResponseErrorMessage, ResponseUnsubscribeMessage} from '../../../messages/nominal';
import {BinaryNotificationMessage, BinaryRequestCompleteMessage, BinaryRequestDataMessage, BinaryRequestErrorMessage, BinaryRequestUnsubscribeMessage, BinaryResponseCompleteMessage, BinaryResponseDataMessage, BinaryResponseErrorMessage, BinaryResponseUnsubscribeMessage, ReactiveRpcBinaryMessage} from '../../../messages/binary';
import {Encoder, decodeFullMessages} from '..';

const encoder = new Encoder();

const encodeData = (data: unknown): Uint8Array => {
  if (data === undefined) return new Uint8Array([]);
  const json = JSON.stringify(data);
  const buf = Buffer.from(json);
  const arr = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) arr[i] = buf[i];
  return arr;
};

const convertMessage = (message: ReactiveRpcMessage): ReactiveRpcBinaryMessage => {
  if (message instanceof ResponseDataMessage) return new BinaryResponseDataMessage(message.id, encodeData(message.data));
  else if (message instanceof ResponseCompleteMessage) return new BinaryResponseCompleteMessage(message.id, encodeData(message.data));
  else if (message instanceof ResponseErrorMessage) return new BinaryResponseErrorMessage(message.id, encodeData(message.data));
  else if (message instanceof ResponseUnsubscribeMessage) return new BinaryResponseUnsubscribeMessage(message.id);
  else if (message instanceof RequestDataMessage) return new BinaryRequestDataMessage(message.id, message.method, encodeData(message.data));
  else if (message instanceof RequestCompleteMessage) return new BinaryRequestCompleteMessage(message.id, message.method, encodeData(message.data));
  else if (message instanceof RequestErrorMessage) return new BinaryRequestErrorMessage(message.id, message.method, encodeData(message.data));
  else if (message instanceof RequestUnsubscribeMessage) return new BinaryRequestUnsubscribeMessage(message.id);
  return new BinaryNotificationMessage(message.method, encodeData(message.data));
};

const convertMessageBack = (message: ReactiveRpcBinaryMessage): ReactiveRpcMessage => {
  if ((message as Message).data !== undefined) {
    const buf = Buffer.from((message as Message).data as Uint8Array);
    if (!buf.length) {
      (message as Message).data = undefined;
    } else {
      const json = buf.toString();
      const data = JSON.parse(json);
      (message as Message).data = data;
    }
  }
  return message;
};

for (const [name, message] of Object.entries(compactMessages)) {
  // if (name !== 'notification3') continue;
  test(name, () => {
    const [nominal] = decode([message]);
    const converted = convertMessage(nominal);
    const encoded = encoder.encode([converted]);
    const decoded = decodeFullMessages(encoded, encoded.byteOffset, encoded.byteLength);
    const decodedAndConverted = convertMessageBack(decoded[0]);
    expect(decodedAndConverted).toEqual(nominal);
  });
}
