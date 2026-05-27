import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Rich-text',
  title: 'Rich-text extension',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
