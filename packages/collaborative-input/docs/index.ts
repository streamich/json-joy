import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-input',
  title: 'collaborative-input',
  type: 'lib',
  subtitle: 'JSON CRDT "str" node synchronization with DOM <input> and <textarea> elements.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-input',
  group: 'plain-text',
  repo: 'streamich/collaborative-input',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
  src: async () => (await import('./text.md')).default,
};
