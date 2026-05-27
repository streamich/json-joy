import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'rpc-calls',
  title: 'rpc-calls',
  type: 'lib',
  subtitle: 'Transport-agnostic Reactive RPC procedure calling semantics.',
  children: [],
  pkg: '@jsonjoy.com/rpc-calls',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-calls',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
