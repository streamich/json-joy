import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'json-pointer',
  slug: 'json-pointer',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
