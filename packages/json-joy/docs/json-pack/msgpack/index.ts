import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as partialDecodingPage} from './partial-decoding';
import {page as benchmarksPage} from './benchmarks';

export const page: ContentPage = {
  name: 'MessagePack',
  subtitle: 'MessagePack serialization and deserialization codec',
  slug: 'msgpack',
  children: [partialDecodingPage, benchmarksPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
