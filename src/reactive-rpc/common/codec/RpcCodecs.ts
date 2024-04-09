import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {RpcMessageCodecs} from './RpcMessageCodecs';

export class RpcCodecs {
  constructor(
    public readonly value: Codecs,
    public readonly messages: RpcMessageCodecs,
  ) {}
}
