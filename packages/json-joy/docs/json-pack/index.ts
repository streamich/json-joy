import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as cborPage} from './cbor';
import {page as msgpackPage} from './msgpack';
import {page as jsonPage} from './json';
import {page as ubjsonPage} from './ubjson';

export const page: ContentPage = {
  name: 'json-pack',
  // title: 'json-pack',
  subtitle: 'JSON serialization and deserialization codecs',
  slug: 'json-pack',
  children: [cborPage, msgpackPage, jsonPage, ubjsonPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
  showContentsTable: true,
};
