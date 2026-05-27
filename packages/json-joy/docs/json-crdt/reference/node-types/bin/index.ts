import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Binary',
  title: 'Binary `bin`',
  slug: 'bin',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
