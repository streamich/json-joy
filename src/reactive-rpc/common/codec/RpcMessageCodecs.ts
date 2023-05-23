import {BinaryRpcMessageCodec} from './binary';
import {CompactRpcMessageCodec} from './compact';
import {JsonRpc2RpcMessageCodec} from './json-rpc-2/JsonRpc2RpcMessageCodec';
import type {RpcMessageCodec} from './types';

export class RpcMessageCodecs {
  binary: RpcMessageCodec;
  compact: RpcMessageCodec;
  jsonRpc2: RpcMessageCodec;

  constructor() {
    this.binary = new BinaryRpcMessageCodec();
    this.compact = new CompactRpcMessageCodec();
    this.jsonRpc2 = new JsonRpc2RpcMessageCodec();
  }
}
