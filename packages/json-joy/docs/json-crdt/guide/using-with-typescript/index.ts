import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Using with TypeScript',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
