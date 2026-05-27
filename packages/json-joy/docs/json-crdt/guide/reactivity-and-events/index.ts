import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Reactivity and events',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
