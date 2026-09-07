import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'RPC Client',
  type: 'lib',
  subtitle: 'Browser client for Reactive JSON-RPC servers.',
  pkg: '@jsonjoy.com/rpc-client',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-client',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'Quick clients',
      subtitle: 'createBinaryClient, createJsonClient, createFetchClient, createClient.',
      // @ts-ignore
      src: async () => (await import('./quick-clients.md')).default,
    },
    {
      name: 'Custom client',
      subtitle: 'Build your own RxPersistentCaller with custom codec, transport, or auth.',
      // @ts-ignore
      src: async () => (await import('./custom-client.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
