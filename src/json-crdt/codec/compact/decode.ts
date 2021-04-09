import {json_string, JSON} from "ts-brand-json";
import {LogicalTimestamp} from "../../../json-crdt-patch/clock";
import {SetRootOperation} from "../../../json-crdt-patch/operations/SetRootOperation";
import {Document} from "../../document";
import {ClockCodec} from "./ClockCodec";
import {decodeNode} from "./decodeNode";

export const decode = (packed: json_string<Array<unknown>>): Document => {
  throw new Error('Not implemented');
  // const data = JSON.parse(packed);
  // const clockCodec = ClockCodec.decode(data[0] as number[]);
  // const doc = new Document(clockCodec.clock);

  // let i: number = 1;

  // const decodeTimestamp = (): LogicalTimestamp => clockCodec.decodeTs(data[i++] as number, data[i++] as number);

  // if (data[i]) {
  //   const id = decodeTimestamp();
  //   const node = decodeNode(doc, clockCodec, data[i++]);
  //   doc.root.insert(new SetRootOperation(id, node.id));
  // }

  // return doc;
};
