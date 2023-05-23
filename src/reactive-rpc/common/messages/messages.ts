import {BinaryMessageType} from '../codec/binary/constants';
import {CompactMessageType} from '../codec/compact/constants';
import {validateId, validateMethod} from '../rpc/validation';
import {CborEncoder} from '../../../json-pack/cbor/CborEncoder';
import {MsgPackEncoder} from '../../../json-pack/msgpack';
import {JsonEncoder} from '../../../json-pack/json/JsonEncoder';
import type {Value} from './Value';
import type {JsonValueCodec} from '../../../json-pack/codecs/types';
import type {BinaryJsonEncoder} from '../../../json-pack/types';
import type * as cmsg from '../codec/compact/types';
import type {Message} from './types';

const encodeHeader = (
  writer: BinaryJsonEncoder['writer'],
  typeU16: number,
  id: number,
  payloadSize: number,
  start: number,
) => {
  if (payloadSize <= 0b1111_11111111) {
    const w1 = typeU16 | payloadSize;
    const w2 = id;
    writer.view.setUint32(start, (w1 << 16) | w2);
  } else if (payloadSize <= 0b1111_11111111_1111111) {
    writer.u8(id & 0xff);
    const w1 = typeU16 | 0b000_1_0000_00000000 | (payloadSize >> 7);
    const w2 = ((payloadSize & 0b0111_1111) << 8) | (id >> 8);
    writer.view.setUint32(start, (w1 << 16) | w2);
  } else {
    writer.u16(id);
    const w1 = typeU16 | 0b000_1_0000_00000000 | (payloadSize >> 15);
    const w2 = 0b1000_0000_00000000 | (payloadSize & 0b0111_1111_11111111);
    writer.view.setUint32(start, (w1 << 16) | w2);
  }
};

const encodeBinaryWithNameAndPayload = (
  codec: JsonValueCodec,
  typeU16: number,
  id: number,
  name: string,
  value: Value<any> | undefined,
) => {
  const writer = codec.encoder.writer;
  const nameLength = name.length;
  writer.ensureCapacity(5 + nameLength);
  writer.uint8[writer.x + 4] = nameLength;
  writer.x += 5;
  writer.ascii(name);
  const x0 = writer.x0;
  const x = writer.x;
  if (value) value.encode(codec);
  const shift = writer.x0 - x0;
  const payloadStart = x + shift;
  const start = payloadStart - 5 - nameLength;
  const payloadSize = writer.x - payloadStart;
  encodeHeader(writer, typeU16, id, payloadSize, start);
};

const encodeBinaryWithPayload = (codec: JsonValueCodec, typeU16: number, id: number, value: Value<any> | undefined) => {
  const writer = codec.encoder.writer;
  writer.move(4);
  const x0 = writer.x0;
  const x = writer.x;
  if (value) value.encode(codec);
  const shift = writer.x0 - x0;
  const payloadStart = x + shift;
  const start = payloadStart - 4;
  const payloadSize = writer.x - payloadStart;
  encodeHeader(writer, typeU16, id, payloadSize, start);
};

const encodeCompactWithNameAndPayload = (
  codec: JsonValueCodec,
  type: CompactMessageType,
  msg: RequestDataMessage | RequestCompleteMessage | RequestErrorMessage,
) => {
  const encoder = codec.encoder;
  if (encoder instanceof CborEncoder || encoder instanceof MsgPackEncoder) {
    const value = msg.value;
    const hasValue = value !== undefined;
    encoder.writeArrHdr(hasValue ? 4 : 3);
    encoder.writeUInteger(type);
    encoder.writeUInteger(msg.id);
    encoder.writeAsciiStr(msg.method);
    if (hasValue) {
      if (value.type) value.type.encoder(codec.format)(value.data, encoder);
      else encoder.writeAny(value.data);
    }
  } else if (encoder instanceof JsonEncoder) {
    const value = msg.value;
    encoder.writeStartArr();
    encoder.writeNumber(type);
    encoder.writeArrSeparator();
    encoder.writeNumber(msg.id);
    encoder.writeArrSeparator();
    encoder.writeAsciiStr(msg.method);
    const hasValue = value !== undefined;
    if (hasValue) {
      encoder.writeArrSeparator();
      if (value.type) value.type.encoder(codec.format)(value.data, encoder);
      else encoder.writeAny(value.data);
    }
    encoder.writeEndArr();
  } else encoder.writeArr(msg.toCompact());
};

const encodeCompactWithPayload = (
  codec: JsonValueCodec,
  type: CompactMessageType,
  msg: ResponseCompleteMessage | ResponseDataMessage | ResponseErrorMessage,
) => {
  const encoder = codec.encoder;
  if (encoder instanceof CborEncoder || encoder instanceof MsgPackEncoder) {
    const value = msg.value;
    const hasValue = value !== undefined;
    encoder.writeArrHdr(hasValue ? 3 : 2);
    encoder.writeUInteger(type);
    encoder.writeUInteger(msg.id);
    if (hasValue) {
      if (value.type) {
        value.type.encoder(codec.format)(value.data, encoder);
      } else encoder.writeAny(value.data);
    }
  } else if (encoder instanceof JsonEncoder) {
    const value = msg.value;
    encoder.writeStartArr();
    encoder.writeNumber(type);
    encoder.writeArrSeparator();
    encoder.writeNumber(msg.id);
    const hasValue = value !== undefined;
    if (hasValue) {
      encoder.writeArrSeparator();
      if (value.type) value.type.encoder(codec.format)(value.data, encoder);
      else encoder.writeAny(value.data);
    }
    encoder.writeEndArr();
  } else encoder.writeArr(msg.toCompact());
};

/**
 * @category Message
 */
export class NotificationMessage<V extends Value<any> = Value> implements Message<cmsg.CompactMessage> {
  constructor(public readonly method: string, public readonly value: V) {}

  public validate(): void {
    validateMethod(this.method);
  }

  public toCompact(): cmsg.CompactNotificationMessage<V> {
    return this.value === undefined
      ? [CompactMessageType.Notification, this.method]
      : [CompactMessageType.Notification, this.method, this.value.data];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    const encoder = codec.encoder;
    if (encoder instanceof CborEncoder || encoder instanceof MsgPackEncoder) {
      const value = this.value;
      const hasValue = value !== undefined;
      encoder.writeArrHdr(hasValue ? 3 : 2);
      encoder.writeUInteger(CompactMessageType.Notification);
      encoder.writeAsciiStr(this.method);
      if (hasValue) {
        if (value.type) value.type.encoder(codec.format)(value.data, encoder);
        else encoder.writeAny(value.data);
      }
    } else if (encoder instanceof JsonEncoder) {
      const value = this.value;
      encoder.writeStartArr();
      encoder.writeNumber(CompactMessageType.Notification);
      encoder.writeArrSeparator();
      encoder.writeAsciiStr(this.method);
      const hasValue = value !== undefined;
      if (hasValue) {
        encoder.writeArrSeparator();
        if (value.type) value.type.encoder(codec.format)(value.data, encoder);
        else encoder.writeAny(value.data);
      }
      encoder.writeEndArr();
    } else encoder.writeArr(this.toCompact());
  }

  public encodeBinary(codec: JsonValueCodec): void {
    const writer = codec.encoder.writer;
    const name = this.method;
    const nameLength = name.length;
    writer.move(4);
    writer.ascii(name);
    const x0 = writer.x0;
    const x = writer.x;
    this.value.encode(codec);
    const shift = writer.x0 - x0;
    const payloadStart = x + shift;
    const start = payloadStart - 4 - nameLength;
    const payloadSize = writer.x - payloadStart;
    writer.view.setUint32(start, (payloadSize << 8) + nameLength);
  }
}

/**
 * @category Message
 */
export class RequestDataMessage<V extends Value<any> = Value> implements Message<cmsg.CompactMessage> {
  constructor(public readonly id: number, public readonly method: string, public readonly value: undefined | V) {}

  public validate(): void {
    validateId(this.id);
    if (this.method) validateMethod(this.method);
  }

  public toCompact(): cmsg.CompactRequestDataMessage<V> {
    return this.value === undefined
      ? [CompactMessageType.RequestData, this.id, this.method]
      : [CompactMessageType.RequestData, this.id, this.method, this.value.data];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    encodeCompactWithNameAndPayload(codec, CompactMessageType.RequestData, this);
  }

  public encodeBinary(codec: JsonValueCodec): void {
    encodeBinaryWithNameAndPayload(codec, BinaryMessageType.RequestData << 13, this.id, this.method, this.value);
  }
}

/**
 * @category Message
 */
export class RequestCompleteMessage<V extends Value<any> = Value> implements Message<cmsg.CompactMessage> {
  constructor(public readonly id: number, public readonly method: string, public readonly value: undefined | V) {}

  public validate(): void {
    validateId(this.id);
    if (this.method) validateMethod(this.method);
  }

  public toCompact(): cmsg.CompactRequestCompleteMessage<V> {
    return this.value === undefined
      ? [CompactMessageType.RequestComplete, this.id, this.method]
      : [CompactMessageType.RequestComplete, this.id, this.method, this.value.data];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    encodeCompactWithNameAndPayload(codec, CompactMessageType.RequestComplete, this);
  }

  public encodeBinary(codec: JsonValueCodec): void {
    encodeBinaryWithNameAndPayload(codec, BinaryMessageType.RequestComplete << 13, this.id, this.method, this.value);
  }
}

/**
 * @category Message
 */
export class RequestErrorMessage<V extends Value<any> = Value> implements Message<cmsg.CompactMessage> {
  constructor(public readonly id: number, public method: string, public readonly value: V) {}

  public validate(): void {
    validateId(this.id);
    if (this.method) validateMethod(this.method);
  }

  public toCompact(): cmsg.CompactRequestErrorMessage<V> {
    return [CompactMessageType.RequestError, this.id, this.method, this.value.data];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    encodeCompactWithNameAndPayload(codec, CompactMessageType.RequestError, this);
  }

  public encodeBinary(codec: JsonValueCodec): void {
    encodeBinaryWithNameAndPayload(codec, BinaryMessageType.RequestError << 13, this.id, this.method, this.value);
  }
}

/**
 * @category Message
 */
export class RequestUnsubscribeMessage implements Message<cmsg.CompactMessage> {
  constructor(public readonly id: number) {}

  public validate(): void {
    validateId(this.id);
  }

  public toCompact(): cmsg.CompactRequestUnsubscribeMessage {
    return [CompactMessageType.RequestUnsubscribe, this.id];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    codec.encoder.writeArr(this.toCompact());
  }

  public encodeBinary(codec: JsonValueCodec): void {
    codec.encoder.writer.u32(0b11100000_00000000_00000000_00000000 | this.id);
  }
}

/**
 * @category Message
 */
export class ResponseCompleteMessage<V extends Value<any> = Value> implements Message<cmsg.CompactMessage> {
  constructor(public readonly id: number, public readonly value: undefined | V) {}

  public validate(): void {
    validateId(this.id);
  }

  public toCompact(): cmsg.CompactResponseCompleteMessage<V> {
    return this.value === undefined
      ? [CompactMessageType.ResponseComplete, this.id]
      : [CompactMessageType.ResponseComplete, this.id, this.value.data];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    encodeCompactWithPayload(codec, CompactMessageType.ResponseComplete, this);
  }

  public encodeBinary(codec: JsonValueCodec): void {
    encodeBinaryWithPayload(codec, BinaryMessageType.ResponseComplete << 13, this.id, this.value);
  }
}

/**
 * @category Message
 */
export class ResponseDataMessage<V extends Value<any> = Value> implements Message<cmsg.CompactMessage> {
  constructor(public readonly id: number, public readonly value: V) {}

  public validate(): void {
    validateId(this.id);
  }

  public toCompact(): cmsg.CompactResponseDataMessage<V> {
    return [CompactMessageType.ResponseData, this.id, this.value.data];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    encodeCompactWithPayload(codec, CompactMessageType.ResponseData, this);
  }

  public encodeBinary(codec: JsonValueCodec): void {
    encodeBinaryWithPayload(codec, BinaryMessageType.ResponseData << 13, this.id, this.value);
  }
}

/**
 * @category Message
 */
export class ResponseErrorMessage<V extends Value<any> = Value> implements Message<cmsg.CompactMessage> {
  constructor(public readonly id: number, public readonly value: V) {}

  public validate(): void {
    validateId(this.id);
  }

  public toCompact(): cmsg.CompactResponseErrorMessage<V> {
    return [CompactMessageType.ResponseError, this.id, this.value.data];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    encodeCompactWithPayload(codec, CompactMessageType.ResponseError, this);
  }

  public encodeBinary(codec: JsonValueCodec): void {
    encodeBinaryWithPayload(codec, BinaryMessageType.ResponseError << 13, this.id, this.value);
  }
}

/**
 * @category Message
 */
export class ResponseUnsubscribeMessage implements Message<cmsg.CompactMessage> {
  constructor(public readonly id: number) {}

  public validate(): void {
    validateId(this.id);
  }

  public toCompact(): cmsg.CompactResponseUnsubscribeMessage {
    return [CompactMessageType.ResponseUnsubscribe, this.id];
  }

  public encodeCompact(codec: JsonValueCodec): void {
    codec.encoder.writeArr(this.toCompact());
  }

  public encodeBinary(codec: JsonValueCodec): void {
    codec.encoder.writer.u32(0b11100000_00000001_00000000_00000000 | this.id);
  }
}
