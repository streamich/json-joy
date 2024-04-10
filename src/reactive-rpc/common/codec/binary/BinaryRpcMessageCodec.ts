import {RpcMessageFormat} from '../constants';
import {decode} from './decode';
import * as msg from '../../messages';
import type {Uint8ArrayCut} from '@jsonjoy.com/util/lib/buffers/Uint8ArrayCut';
import type {RpcMessageCodec} from '../types';
import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';

export class BinaryRpcMessageCodec implements RpcMessageCodec {
  id = 'rx.binary';
  format = RpcMessageFormat.Compact;

  public encodeMessage(jsonCodec: JsonValueCodec, message: msg.ReactiveRpcMessage): void {
    message.encodeBinary(jsonCodec);
  }

  public encodeBatch(jsonCodec: JsonValueCodec, batch: msg.ReactiveRpcMessage[]): void {
    const length = batch.length;
    for (let i = 0; i < length; i++) batch[i].encodeBinary(jsonCodec);
  }

  public decodeBatch(jsonCodec: JsonValueCodec, uint8: Uint8Array): msg.ReactiveRpcMessage[] {
    const decoder = jsonCodec.decoder;
    const reader = decoder.reader;
    reader.reset(uint8);
    const size = uint8.length;
    const messages: msg.ReactiveRpcMessage[] = [];
    while (reader.x < size) {
      const message = decode(reader);
      messages.push(message);
    }
    const length = messages.length;
    for (let i = 0; i < length; i++) {
      const message = messages[i];
      const value = (message as any).value;
      if (value) {
        const cut = value.data as Uint8ArrayCut;
        const arr = cut.uint8.subarray(cut.start, cut.start + cut.size);
        const data = arr.length ? decoder.read(arr) : undefined;
        if (data === undefined) (message as any).value = undefined;
        else value.data = data;
      }
    }
    return messages;
  }

  public encode(jsonCodec: JsonValueCodec, batch: msg.ReactiveRpcMessage[]): Uint8Array {
    const encoder = jsonCodec.encoder;
    const writer = encoder.writer;
    writer.reset();
    this.encodeBatch(jsonCodec, batch);
    return writer.flush();
  }
}
