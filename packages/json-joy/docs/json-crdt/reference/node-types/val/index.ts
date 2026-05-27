import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Value',
  title: 'Value `val`',
  slug: 'val',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
