import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'RPC Server',
  type: 'lib',
  subtitle: 'HTTP/1.1 and WebSocket server for Reactive JSON-RPC.',
  pkg: '@jsonjoy.com/rpc-server',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-server',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'HTTP1 server',
      subtitle: 'RpcServer and Http1Server: defaults, custom routes, TLS.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./http1-server.md')).default,
    },
    {
      name: 'uWS backend',
      subtitle: 'An alternative backend using uWebSockets.js.',
      // @ts-ignore
      src: async () => (await import('./uws-backend.md')).default,
    },
    {
      name: 'Connection context',
      subtitle: 'Per-request data: IP, token, route params, codec negotiation.',
      // @ts-ignore
      src: async () => (await import('./connection-context.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
