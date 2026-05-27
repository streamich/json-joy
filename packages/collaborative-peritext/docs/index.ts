import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-peritext',
  title: 'collaborative-peritext',
  type: 'lib',
  subtitle: 'JSON CRDT "peritext" node bindings to any generic rich-text editor.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-peritext',
  group: 'rich-text',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/collaborative-peritext',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
