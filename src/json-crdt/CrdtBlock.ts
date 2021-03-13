import {
  JsonCrdtArrayNode,
  JsonCrdtArrayNodeChunk,
  JsonCrdtBlock,
  JsonCrdtChunk,
  JsonCrdtNode,
  JsonCrdtNodeTypes,
  JsonCrdtObjectNode,
  JsonCrdtObjectNodeChunk,
  JsonCrdtRefEntry,
  JsonCrdtStringNode,
  JsonCrdtStringNodeChunk,
  JsonCrdtValue
} from "./types";
import {JsonCrdtRef} from "./types";
import {generateId} from "./util";

export const toJson = (refs: Record<string, undefined | JsonCrdtRefEntry>, ref: string): unknown => {
  const node = refs[ref] as JsonCrdtNode;
  if (!Array.isArray(node)) return node;
  const [type, firstChunkRef] = node;
  switch (type) {
    case JsonCrdtNodeTypes.Array: {
      const arr: unknown[] = [];
      let chunkRef = firstChunkRef;
      while (chunkRef) {
        const chunk = refs[chunkRef] as JsonCrdtArrayNodeChunk;
        const [, rightChunkRef, value] = chunk;
        arr.push(typeof value === 'string' ? toJson(refs, value) : value);
        chunkRef = rightChunkRef;
      }
      return arr;
    }
    case JsonCrdtNodeTypes.Object: {
      const obj: Record<string, unknown> = {};
      let chunkRef = firstChunkRef;
      while (chunkRef) {
        const chunk = refs[chunkRef] as JsonCrdtObjectNodeChunk;
        const [, key, value] = chunk;
        obj[key] = typeof value === 'string' ? toJson(refs, value) : value;
        chunkRef = chunk[0];
      }
      return obj;
    }
    case JsonCrdtNodeTypes.String: {
      let str: string = '';
      let chunkRef = firstChunkRef;
      while (chunkRef) {
        const chunk = refs[chunkRef] as JsonCrdtStringNodeChunk;
        str += chunk[1]
        chunkRef = chunk[0];
      }
      return str;
    }
  }
};

export class CrdtNode {}

export class CrdtBooleanNode {
  toJson() {

  }
}

export class CrdtObjectNode {
  toJson() {

  }
}

export class CrdtBlock {
  public clientId: string = generateId(6);
  public clock: number = 0;

  constructor(public readonly refs: Record<string, undefined | JsonCrdtRefEntry> = {
    '': [JsonCrdtNodeTypes.Object, ''],
  }) {}

  private nextRef(ticks: number = 1): JsonCrdtRef {
    const id = this.clientId + this.clock;
    this.clock += ticks;
    return id;
  }

  private insertString(str: string): JsonCrdtRef {
    const chunk: JsonCrdtStringNodeChunk = ['', str];
    const firstChunkRef = this.nextRef();
    this.refs[firstChunkRef] = chunk;
    const node: JsonCrdtStringNode = [JsonCrdtNodeTypes.String, firstChunkRef];
    const nodeRef = this.nextRef();
    this.refs[nodeRef] = node;
    return nodeRef;
  }

  private insertArray(arr: unknown[]): JsonCrdtRef {
    const node: JsonCrdtArrayNode = [JsonCrdtNodeTypes.Array, ''];
    const nodeRef = this.nextRef();
    this.refs[nodeRef] = node;
    let leftChunkRef: JsonCrdtRef = '';
    let leftChunk: undefined | JsonCrdtArrayNodeChunk;
    for (let i = 0; i < arr.length; i++) {
      const value = this.insert(arr[i]);
      const chunk: JsonCrdtArrayNodeChunk = [leftChunkRef, '', value];
      const chunkRef = this.nextRef();
      this.refs[chunkRef] = chunk;
      if (leftChunk) leftChunk[1] = chunkRef;
      leftChunkRef = chunkRef;
      leftChunk = chunk;
      const isFirstElement = !i;
      if (isFirstElement) node[1] = chunkRef;
    }
    return nodeRef;
  }

  public insert(jsonValue: unknown): JsonCrdtValue {
    if (jsonValue === null) return null;
    if (Array.isArray(jsonValue)) return this.insertArray(jsonValue);
    if (typeof jsonValue === 'object') return '';
    if (typeof jsonValue === 'string') return this.insertString(jsonValue);
    return jsonValue as boolean | number;
  }

  public insertObjectKey(objectRef: string, key: string, value: unknown) {
    const objectNode = this.refs[objectRef] as JsonCrdtObjectNode;
    if (!objectNode) throw new Error('NO_REF');
    const [type, firstChunkRef] = objectNode;
    if (type !== JsonCrdtNodeTypes.Object) throw new Error('INVALID_REF');
    const newChunk: JsonCrdtObjectNodeChunk = ['', key, this.insert(value)];
    const newChunkRef = this.nextRef();
    this.refs[newChunkRef] = newChunk;
    const isObjectEmpty = !firstChunkRef;
    if (isObjectEmpty) {
      objectNode[1] = newChunkRef;
      return;
    }
    let iChunk: JsonCrdtObjectNodeChunk = this.refs[firstChunkRef] as JsonCrdtObjectNodeChunk;
    while (iChunk[0]) iChunk = this.refs[iChunk[0]] as JsonCrdtObjectNodeChunk;
    iChunk[0] = newChunkRef;
  }

  public toJson(): unknown {
    return toJson(this.refs, '');
  }
}
