import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'JSON CRDT Repo',
  type: 'lib',
  subtitle: 'Local-first browser client that persists JSON CRDTs and syncs with the server.',
  pkg: '@jsonjoy.com/json-crdt-repo',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/json-crdt-repo',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'Repo',
      subtitle: 'JsonCrdtRepo: top-level constructor that wires storage, remote, and sessions.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./repo.md')).default,
    },
    {
      name: 'Sessions',
      subtitle: 'EditSession + EditSessionFactory: per-document editor handles.',
      // @ts-ignore
      src: async () => (await import('./sessions.md')).default,
    },
    {
      name: 'Storage',
      subtitle: 'LevelLocalRepo: IndexedDB persistence and cross-tab sync.',
      // @ts-ignore
      src: async () => (await import('./storage.md')).default,
    },
    {
      name: 'Remote',
      subtitle: 'DemoServerRemoteHistory and the RemoteHistory interface.',
      // @ts-ignore
      src: async () => (await import('./remote.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
