import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'String',
  title: 'String `str`',
  slug: 'str',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
