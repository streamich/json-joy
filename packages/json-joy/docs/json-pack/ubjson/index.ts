import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'UBJSON',
  subtitle: 'UBJSON serialization and deserialization codec',
  slug: 'ubjson',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
