import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-slate',
  title: 'collaborative-slate',
  type: 'lib',
  subtitle: 'JSON CRDT integration with Slate.js and Plate.js for collaborative rich-text editing.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-slate',
  group: 'rich-text',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/collaborative-slate',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
