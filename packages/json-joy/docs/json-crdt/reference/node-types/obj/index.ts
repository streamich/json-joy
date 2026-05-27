import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Object',
  title: 'Object `obj`',
  slug: 'obj',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
