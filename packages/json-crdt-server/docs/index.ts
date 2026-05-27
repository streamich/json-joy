import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'json-crdt-server',
  title: 'json-crdt-server',
  type: 'lib',
  subtitle: 'JSON CRDT HTTP/WebSocket server with persistent on-disk or in-memory storage.',
  children: [],
  pkg: '@jsonjoy.com/json-crdt-server',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/json-crdt-server',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
