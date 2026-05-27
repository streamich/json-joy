import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'json-crdt-repo',
  title: 'json-crdt-repo',
  type: 'lib',
  subtitle: 'Local-first browser client that persists JSON CRDTs and syncs with the server.',
  children: [],
  pkg: '@jsonjoy.com/json-crdt-repo',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/json-crdt-repo',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
