import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-codemirror',
  title: 'collaborative-codemirror',
  type: 'lib',
  subtitle: 'CodeMirror editor integration for json-joy, synchronizes the editor with a "str" node.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-codemirror',
  group: 'plain-text',
  repo: 'streamich/collaborative-codemirror',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./index.md')).default,
};
