import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Array',
  title: 'Array `arr`',
  slug: 'arr',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
