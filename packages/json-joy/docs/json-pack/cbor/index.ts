import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as partialDecodingPage} from './partial-decoding';
import {page as benchmarksPage} from './benchmarks';

export const page: ContentPage = {
  name: 'CBOR',
  // title: 'json-pack',
  subtitle: 'CBOR serialization and deserialization codec',
  slug: 'cbor',
  children: [partialDecodingPage, benchmarksPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
