import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'RPC Messages',
  type: 'lib',
  subtitle: 'Message types for the JSON Reactive RPC (JSON Rx) protocol.',
  pkg: '@jsonjoy.com/rpc-messages',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-messages',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
