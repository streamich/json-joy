import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  slug: 'click-json',
  name: 'Clickable JSON',
  title: 'Clickable JSON — UI',
  type: 'lib',
  subtitle: 'React components for rendering JSON and JSON CRDT documents as interactive clickable and editable trees.',
  pkg: '@jsonjoy.com/click-json',
  group: 'ui',
  repo: 'streamich/clickable-json',
  tech: 'React.js',
  techIcon: {set: 'lineicons', icon: 'react'},
  // @ts-ignore
  src: async () => (await import('./index.md')).default,
  children: [
    {
      name: 'JSON',
      children: [],
      // @ts-ignore
      src: async () => (await import('./json.md')).default,
    },
    {
      name: 'JSON CRDT',
      children: [],
      // @ts-ignore
      src: async () => (await import('./json-crdt.md')).default,
    },
  ],
};
