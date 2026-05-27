import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-prosemirror',
  title: 'collaborative-prosemirror',
  type: 'lib',
  subtitle: 'ProseMirror bindings for the JSON CRDT Peritext rich-text node.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-prosemirror',
  group: 'rich-text',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/collaborative-prosemirror',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
