import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'json-expression',
  slug: 'json-expression',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
