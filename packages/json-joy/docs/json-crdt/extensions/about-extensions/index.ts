import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'About extensions',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
