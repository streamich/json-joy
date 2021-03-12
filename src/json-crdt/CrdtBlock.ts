import {
  JsonCrdtArrayNodeChunk,
  JsonCrdtBlock,
  JsonCrdtNode,
  JsonCrdtNodeTypes,
  JsonCrdtObjectNodeChunk,
  JsonCrdtStringNodeChunk
} from "./types";

export class CrdtBlock {
  constructor(public readonly crdt: JsonCrdtBlock) {
  }

  public toJson(node: JsonCrdtNode = this.crdt.node): unknown {
    if (!node) return node;
    if (typeof node !== 'object') return node;
    switch (node.t) {
      case JsonCrdtNodeTypes.Array: {
        const arr: unknown[] = [];
        let id: string | undefined = node.l;
        let chunk: JsonCrdtArrayNodeChunk | undefined;
        while (id && (chunk = node.chunks[id])) {
          arr.push(this.toJson(chunk.val));
          id = chunk.r1;
        }
        return arr;
      }
      case JsonCrdtNodeTypes.Object: {
        const obj: Record<string, unknown> = {};
        let id: string | undefined = node.l;
        let chunk: JsonCrdtObjectNodeChunk | undefined;
        while (id && (chunk = node.chunks[id])) {
          obj[chunk.key] = this.toJson(chunk.val);
          id = chunk.r1;
        }
        return obj;
      }
      case JsonCrdtNodeTypes.String: {
        let str: string = '';
        let id: string | undefined = node.l;
        let chunk: JsonCrdtStringNodeChunk | undefined;
        while (id && (chunk = node.chunks[id])) {
          str += chunk.val;
          id = chunk.r1;
        }
        return str;
      }
    }
  }
}
