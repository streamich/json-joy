import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Vector',
  title: 'Vector `vec`',
  slug: 'vec',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
