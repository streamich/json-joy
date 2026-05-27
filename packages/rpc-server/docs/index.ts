import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'rpc-server',
  title: 'rpc-server',
  type: 'lib',
  subtitle: 'HTTP/1.1 and WebSocket server for Reactive JSON-RPC.',
  children: [],
  pkg: '@jsonjoy.com/rpc-server',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-server',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
