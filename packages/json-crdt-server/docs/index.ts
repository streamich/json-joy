import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'JSON CRDT Server',
  type: 'lib',
  subtitle: 'JSON CRDT HTTP/WebSocket server with persistent on-disk or in-memory storage.',
  pkg: '@jsonjoy.com/json-crdt-server',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/json-crdt-server',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'Block API',
      subtitle: 'CRUD plus history, scan, pull, and streaming subscriptions for documents.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./block-api.md')).default,
    },
    {
      name: 'Presence',
      subtitle: 'Per-room user presence with TTL-based expiration.',
      // @ts-ignore
      src: async () => (await import('./presence.md')).default,
    },
    {
      name: 'Pub/Sub',
      slug: 'pubsub',
      subtitle: 'Lightweight publish/subscribe messaging on named channels.',
      // @ts-ignore
      src: async () => (await import('./pubsub.md')).default,
    },
    {
      name: 'Embedding',
      subtitle: 'Run the server programmatically and add your own routes.',
      // @ts-ignore
      src: async () => (await import('./embedding.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
