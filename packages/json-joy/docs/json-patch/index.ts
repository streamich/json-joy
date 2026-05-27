import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'json-patch',
  slug: 'json-patch',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
