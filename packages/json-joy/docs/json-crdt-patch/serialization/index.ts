import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Serialization',
  slug: 'serialization',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
