import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';

export const page: LibPage = {
  name: 'json-pack',
  title: 'json-pack',
  type: 'lib',
  subtitle: 'The fastest JSON, CBOR, MessagePack, and binary serialization codecs for JavaScript.',
  pkg: '@jsonjoy.com/json-pack',
  group: 'tooling',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/json-pack',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showContentsTable: true,
  children: [
    {
      name: 'CBOR',
      subtitle: 'Concise Binary Object Representation: fast, full, stable, and DAG-CBOR codecs.',
      // @ts-ignore raw markdown, loaded by the site's webpack raw-loader
      src: async () => (await import('./cbor.md')).default,
    },
    {
      name: 'MessagePack',
      subtitle: 'MessagePack encoders and decoders, extensions, and shallow reading.',
      // @ts-ignore
      src: async () => (await import('./messagepack.md')).default,
    },
    {
      name: 'JSON',
      subtitle: 'Binary JSON encoder/decoder and the JSON Binary extension for Uint8Array.',
      // @ts-ignore
      src: async () => (await import('./json.md')).default,
    },
    {
      name: 'More formats',
      subtitle: 'UBJSON, BSON, RESP, Bencode, and Amazon Ion codecs.',
      // @ts-ignore
      src: async () => (await import('./more-formats.md')).default,
    },
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
