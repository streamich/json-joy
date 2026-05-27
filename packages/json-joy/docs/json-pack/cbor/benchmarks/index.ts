import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Benchmarks',
  slug: 'benchmarks',
  children: [],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
