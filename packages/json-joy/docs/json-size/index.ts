import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'json-size',
  slug: 'json-size',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
