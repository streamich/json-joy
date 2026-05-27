import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-str',
  title: 'collaborative-str',
  type: 'lib',
  subtitle: 'JSON CRDT "str" node bindings to any generic plain text editor.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-str',
  group: 'plain-text',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/collaborative-str',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
