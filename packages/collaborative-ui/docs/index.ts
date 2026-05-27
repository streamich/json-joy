import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'collaborative-ui',
  title: 'collaborative-ui',
  type: 'lib',
  subtitle: 'React component library for building real-time collaborative editing applications.',
  children: [],
  pkg: '@jsonjoy.com/collaborative-ui',
  group: 'ui',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/collaborative-ui',
  tech: 'React.js',
  techIcon: {set: 'lineicons', icon: 'react'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
