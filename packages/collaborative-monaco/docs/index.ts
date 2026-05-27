import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-monaco',
  title: 'collaborative-monaco',
  type: 'lib',
  subtitle: 'Monaco editor integration for json-joy, synchronizes the editor with a "str" node.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-monaco',
  group: 'plain-text',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/collaborative-monaco',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./index.md')).default,
};
