import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: ContentPage = {
  name: 'Why use JSON CRDT',
  title: 'Why use json-joy JSON CRDT',
  slug: 'why-json-crdt',
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
