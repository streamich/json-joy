import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'JIT Router',
  type: 'lib',
  subtitle: 'High-performance HTTP path router with JIT-compiled matchers.',
  pkg: '@jsonjoy.com/jit-router',
  group: 'tooling',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/jit-router',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'Route patterns',
      subtitle: 'Exact, parameter, and regex steps; delimiters and wildcards.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./route-patterns.md')).default,
    },
    {
      name: 'Router API',
      subtitle: 'Router, Destination, Route, Match, and the matcher function.',
      // @ts-ignore
      src: async () => (await import('./router-api.md')).default,
    },
    {
      name: 'Compilation',
      subtitle: 'How JIT codegen turns the tree into a fast matcher.',
      // @ts-ignore
      src: async () => (await import('./compilation.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
