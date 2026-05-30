import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'JSON Expression',
  title: 'JSON Expression',
  type: 'lib',
  subtitle: 'A JSON-native expression language that evaluates directly or JIT-compiles to fast JavaScript.',
  pkg: '@jsonjoy.com/json-expression',
  group: 'tooling',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/json-expression',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'Variables',
      subtitle: 'Read input with the $ / get operators and the Vars container.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./variables.md')).default,
    },
    {
      name: 'Evaluate and compile',
      subtitle: 'Interpret expressions with evaluate() or JIT-compile them with JsonExpressionCodegen.',
      // @ts-ignore
      src: async () => (await import('./evaluate-and-compile.md')).default,
    },
    {
      name: 'Math and logic',
      subtitle: 'Arithmetic, comparison, logical, bitwise, and branching operators.',
      // @ts-ignore
      src: async () => (await import('./math-and-logic.md')).default,
    },
    {
      name: 'Strings and types',
      subtitle: 'Type checks and casts, container access, string operators, and binary reads.',
      // @ts-ignore
      src: async () => (await import('./strings-and-types.md')).default,
    },
    {
      name: 'Collections',
      subtitle: 'Array, object, and JSON Patch operators, including filter, map, and reduce.',
      // @ts-ignore
      src: async () => (await import('./collections.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
