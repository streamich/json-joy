import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'JSON',
  subtitle: 'JSON serialization and deserialization codec',
  slug: 'json',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
