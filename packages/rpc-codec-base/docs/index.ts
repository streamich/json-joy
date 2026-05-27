import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'rpc-codec-base',
  title: 'rpc-codec-base',
  type: 'lib',
  subtitle: 'Base types and utilities shared by Reactive RPC message codecs.',
  children: [],
  pkg: '@jsonjoy.com/rpc-codec-base',
  group: 'sync',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/rpc-codec-base',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
