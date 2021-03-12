import {
  JsonCrdtArrayNodeChunk,
  JsonCrdtBlock,
  JsonCrdtNode,
  JsonCrdtNodeTypes,
  JsonCrdtObjectNodeChunk,
  JsonCrdtStringNodeChunk
} from "./types";


export const toJson = (node: JsonCrdtNode): unknown => {
  if (!node) return node;
  if (typeof node !== 'object') return node;
  switch (node.t) {
    case JsonCrdtNodeTypes.Array: {
      const arr: unknown[] = [];
      let id: string | undefined = node.l;
      let chunk: JsonCrdtArrayNodeChunk | undefined;
      while (id && (chunk = node.c[id])) {
        const content = chunk.c;
        if (content !== undefined) arr.push(toJson(content));
        id = chunk.r1;
      }
      return arr;
    }
    case JsonCrdtNodeTypes.Object: {
      const obj: Record<string, unknown> = {};
      let id: string | undefined = node.l;
      let chunk: JsonCrdtObjectNodeChunk | undefined;
      while (id && (chunk = node.c[id])) {
        const tuple = chunk.c;
        if (tuple) obj[tuple[0]] = toJson(tuple[1]);
        id = chunk.r1;
      }
      return obj;
    }
    case JsonCrdtNodeTypes.String: {
      let str: string = '';
      let id: string | undefined = node.l;
      let chunk: JsonCrdtStringNodeChunk | undefined;
      while (id && (chunk = node.c[id])) {
        str += chunk.c || '';
        id = chunk.r1;
      }
      return str;
    }
  }
};

export class CrdtBlock {
  constructor(public readonly crdt: JsonCrdtBlock) {
  }

  public toJson(node: JsonCrdtNode = this.crdt.node): unknown {
    return toJson(node);
  }
}
