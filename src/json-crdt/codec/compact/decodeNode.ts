import {NULL, TRUE, FALSE, UNDEFINED} from "../../constants";
import type {Document} from "../../document";
import type {JsonNode} from "../../types";
import {ObjectType} from "../../types/lww-object/ObjectType";
import {ArrayType} from "../../types/rga-array/ArrayType";
import {StringType} from "../../types/rga-string/StringType";
import {ClockCodec} from "./ClockCodec";

export const decodeNode = (doc: Document, codec: ClockCodec, data: unknown): JsonNode => {
  switch(data) {
    case 1: return NULL;
    case 2: return TRUE;
    case 3: return FALSE;
    case 4: return UNDEFINED;
  }
  if (Array.isArray(data)) {
    switch(data[0]) {
      case 0: {
        const node = ObjectType.decodeCompact(doc, codec, data);
        doc.nodes.index(node);
        return node;
      }
      // case 1: {
        // const node = ArrayType.decodeCompact(doc, codec, data);
        // doc.nodes.index(node);
        // return node;
      // }
      case 2: {
        const node = StringType.decodeCompact(doc, codec, data);
        doc.nodes.index(node);
        return node;
      }
    }
  }
  throw new Error('UNKNOWN_NODE');
};
