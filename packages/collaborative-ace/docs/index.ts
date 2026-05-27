import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-ace',
  title: 'collaborative-ace',
  type: 'lib',
  subtitle: 'Ace editor integration for json-joy, synchronizes the editor with a "str" node.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-ace',
  group: 'plain-text',
  repo: 'streamich/collaborative-ace',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./index.md')).default,
};
