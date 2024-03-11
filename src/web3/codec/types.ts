import type {BinaryJsonDecoder, BinaryJsonEncoder} from '../../json-pack/types';

export interface IpldCodec {
  name: string;
  encoder: Pick<BinaryJsonEncoder, 'encode'>;
  decoder: Pick<BinaryJsonDecoder, 'decode'>;
}
