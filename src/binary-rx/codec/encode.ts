import {varUint8Size, writeVarUint8} from "../../json-crdt-patch/codec/binary/util/varuint8";
import {CompleteMessage} from "../messages/CompleteMessage";
import {DataMessage} from "../messages/DataMessage";
import {Messages} from "../messages/types";

export const encode = (message: Messages): Uint8Array => {
  if (message instanceof CompleteMessage) {
    const payloadSize = message.payload ? message.payload.byteLength : 0;
    const bodySize = 2 + payloadSize;
    const varIntSize = varUint8Size(bodySize);
    const size = 1 + varIntSize + bodySize;
    const uint8 = new Uint8Array(size);
    const view = new DataView(uint8.buffer);
    uint8[0] = 0;
    let offset = writeVarUint8(bodySize, uint8, 1);
    view.setUint16(offset, message.id);
    offset += 2;
    if (message.payload) uint8.set(message.payload, offset);
    return uint8;
  }
  if (message instanceof DataMessage) {
    const payloadSize = message.payload.byteLength;
    const bodySize = 2 + payloadSize;
    const varIntSize = varUint8Size(bodySize);
    const size = 1 + varIntSize + bodySize;
    const uint8 = new Uint8Array(size);
    const view = new DataView(uint8.buffer);
    uint8[0] = 1;
    let offset = writeVarUint8(bodySize, uint8, 1);
    view.setUint16(offset, message.id);
    offset += 2;
    uint8.set(message.payload, offset);
    return uint8;
  }
  throw new Error('UNKNOWN_MESSAGE');
};
