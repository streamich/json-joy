import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'json-brand',
  slug: 'json-brand',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
