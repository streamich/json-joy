import type {RespEncoder} from "../json-pack/resp";
import type {RespStreamingDecoder} from "../json-pack/resp/RespStreamingDecoder";

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export interface RedisClientCodecOpts {
  encoder: RespEncoder;
  decoder: RespStreamingDecoder;
}
