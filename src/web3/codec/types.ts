import type {BinaryJsonDecoder, BinaryJsonEncoder} from '@jsonjoy.com/json-pack/lib/types';

export interface IpldCodec {
  name: string;
  encoder: Pick<BinaryJsonEncoder, 'encode'>;
  decoder: Pick<BinaryJsonDecoder, 'decode'>;
}
