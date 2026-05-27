import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Partial decoding',
  slug: 'partial-decoding',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
