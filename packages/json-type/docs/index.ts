import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'JSON Type',
  type: 'lib',
  subtitle: 'TypeScript-first JSON schema with JIT validators and codecs.',
  pkg: '@jsonjoy.com/json-type',
  group: 'tooling',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/json-type',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'Types',
      subtitle: 'The t builder, all type kinds, options, and TypeScript inference.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./types.md')).default,
    },
    {
      name: 'Modules',
      subtitle: 'ModuleType, aliases, refs, and function procedures.',
      // @ts-ignore
      src: async () => (await import('./modules.md')).default,
    },
    {
      name: 'Validators',
      subtitle: 'JIT-compiled runtime validation with boolean, string, or object errors.',
      // @ts-ignore
      src: async () => (await import('./validators.md')).default,
    },
    {
      name: 'Codecs',
      subtitle: 'JSON text, JSON binary, CBOR, and MessagePack encoders; capacity estimator.',
      // @ts-ignore
      src: async () => (await import('./codecs.md')).default,
    },
    {
      name: 'Interop',
      subtitle: 'JSON Schema, JSON Type Definition, TypeScript export, and random values.',
      // @ts-ignore
      src: async () => (await import('./interop.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
