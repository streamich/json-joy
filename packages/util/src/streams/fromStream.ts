import {listToUint8} from '@jsonjoy.com/buffers/lib/concat';

export const fromStream = async (stream: ReadableStream<Uint8Array>): Promise<Uint8Array> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return listToUint8(chunks);
};
