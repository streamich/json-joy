import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'rpc-error',
  title: 'rpc-error',
  type: 'lib',
  subtitle: 'Error class and error codes for JSON Reactive RPC APIs.',
  children: [],
  pkg: '@jsonjoy.com/rpc-error',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-error',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
