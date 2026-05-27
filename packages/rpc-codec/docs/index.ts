import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'rpc-codec',
  title: 'rpc-codec',
  type: 'lib',
  subtitle: 'Codec aggregator for Reactive RPC messages.',
  children: [],
  pkg: '@jsonjoy.com/rpc-codec',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-codec',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
