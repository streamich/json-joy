import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as serializationPage} from './serialization';

export const page: ContentPage = {
  name: 'json-crdt-patch',
  subtitle: 'JSON CRDT Patch',
  slug: 'json-crdt-patch',
  children: [serializationPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
