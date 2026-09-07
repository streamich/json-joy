import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'RPC Codec',
  type: 'lib',
  subtitle: 'Codec aggregator for Reactive RPC messages.',
  pkg: '@jsonjoy.com/rpc-codec',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-codec',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'RpcCodec',
      subtitle: 'One concrete codec: bundle of message + request/response value codecs.',
      // @ts-ignore
      src: async () => (await import('./rpc-codec.md')).default,
    },
    {
      name: 'RpcCodecs',
      subtitle: 'Registry that resolves codecs from a Content-Type specifier.',
      // @ts-ignore
      src: async () => (await import('./rpc-codecs.md')).default,
    },
    {
      name: 'Batch codecs',
      slug: 'compact-batch',
      subtitle: 'String and binary BatchCodec implementations for request/response transports.',
      // @ts-ignore
      src: async () => (await import('./compact-batch.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
