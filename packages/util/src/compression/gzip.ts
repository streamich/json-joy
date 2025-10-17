import {fromStream} from '../streams/fromStream';
import {toStream} from '../streams/toStream';

const pipeThrough = async (
  data: Uint8Array,
  transform: ReadableWritablePair<Uint8Array, Uint8Array>,
): Promise<Uint8Array> => await fromStream(toStream(data).pipeThrough<Uint8Array>(transform));

export const gzip = async (data: Uint8Array): Promise<Uint8Array> =>
  await pipeThrough(data, new CompressionStream('gzip') as any);

export const ungzip = async (data: Uint8Array): Promise<Uint8Array> =>
  await pipeThrough(data, new DecompressionStream('gzip') as any);
