import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'json-equal',
  slug: 'json-equal',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
