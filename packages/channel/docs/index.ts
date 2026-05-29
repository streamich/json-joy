import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'Channel',
  type: 'lib',
  subtitle: 'Bidirectional communication channel abstraction over WebSocket, fetch, and more.',
  pkg: '@jsonjoy.com/channel',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/channel',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'Physical channel',
      subtitle: 'The PhysicalChannel interface, states, and lifecycle events.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./physical-channel.md')).default,
    },
    {
      name: 'Transports',
      subtitle: 'WebSocketChannel, FetchPhysicalChannel, Utf8Channel.',
      // @ts-ignore
      src: async () => (await import('./transports.md')).default,
    },
    {
      name: 'Persistent channel',
      subtitle: 'PersistentPhysicalChannel: auto-reconnect with configurable backoff.',
      // @ts-ignore
      src: async () => (await import('./persistent-channel.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
