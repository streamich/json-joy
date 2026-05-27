import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Multi-value',
  title: 'Multi-value register extension',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
