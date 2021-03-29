import {json_string, JSON} from "ts-brand-json";
import {LogicalTimestamp} from "../../../json-crdt-patch/clock";
import {SetRootOperation} from "../../../json-crdt-patch/operations/SetRootOperation";
import {Document} from "../../document";
import {NumberType} from "../../types/lww-number/NumberType";
import {ObjectType} from "../../types/lww-object/ObjectType";
import {ArrayType} from "../../types/rga-array/ArrayType";
import {ClockCodec} from "./ClockCodec";

export const decode = (packed: json_string<Array<unknown>>): Document => {
  const data = JSON.parse(packed);
  const length = data.length;
  const clockCodec = ClockCodec.decode(data[0] as number[]);
  const doc = new Document(clockCodec.clock);

  let i: number = 1;

  const decodeTimestamp = (): LogicalTimestamp => clockCodec.decodeTs(data[i++] as number, data[i++] as number);

  if (data[i]) {
    const id = decodeTimestamp();
    const value = decodeTimestamp();
    doc.root.insert(new SetRootOperation(id, value));
  }

  while (i < length) {
    const packed = data[i++] as Array<number | string>;
    switch(packed[0]) {
      case 0: {
        const node = ObjectType.deserialize(doc, clockCodec, packed);
        doc.nodes.index(node);
        break;
      }
      case 1: {
        const node = ArrayType.deserialize(doc, clockCodec, packed);
        doc.nodes.index(node);
        break;
      }
      case 3: {
        const node = NumberType.deserialize(clockCodec, packed as number[]);
        doc.nodes.index(node);
        break;
      }
    }
  }

  return doc;
};
