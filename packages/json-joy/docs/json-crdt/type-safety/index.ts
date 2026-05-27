import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Type safety',
  // slug: 'type-safety',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
