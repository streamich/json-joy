import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Node types',
  slug: 'node-types',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
