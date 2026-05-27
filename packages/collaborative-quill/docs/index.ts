import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-quill',
  title: 'collaborative-quill',
  type: 'lib',
  subtitle: 'Collaborative editing for the Quill editor via a JSON CRDT quill-delta node.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-quill',
  group: 'rich-text',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/collaborative-quill',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
