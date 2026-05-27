import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'rpc-client',
  title: 'rpc-client',
  type: 'lib',
  subtitle: 'Browser client for Reactive JSON-RPC servers.',
  children: [],
  pkg: '@jsonjoy.com/rpc-client',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-client',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
