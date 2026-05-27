import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'json-binary',
  slug: 'json-binary',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
