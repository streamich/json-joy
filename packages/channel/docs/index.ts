import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'channel',
  title: 'channel',
  type: 'lib',
  subtitle: 'Bidirectional communication channel abstraction over WebSocket, fetch, and more.',
  children: [],
  pkg: '@jsonjoy.com/channel',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/channel',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
