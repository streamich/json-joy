import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'RPC Error',
  type: 'lib',
  subtitle: 'Error class and error codes for JSON Reactive RPC APIs.',
  pkg: '@jsonjoy.com/rpc-error',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-error',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'Error class',
      subtitle: 'RpcError factories, error codes, and choosing the right one.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./error-class.md')).default,
    },
    {
      name: 'Serialization',
      subtitle: 'Wire format, isRpcError, RpcLogger.',
      // @ts-ignore
      src: async () => (await import('./serialization.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
