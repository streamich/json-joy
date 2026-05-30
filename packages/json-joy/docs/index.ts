import type {LibPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as gettingStartedPage} from './getting-started';
import {page as jsonPackPage} from './json-pack';
import {page as jsonCrdtPage} from './json-crdt';
import {page as jsonCrdtPatchPage} from './json-crdt-patch';
import {page as jsonBinaryPage} from './json-binary';
import {page as jsonBrandPage} from './json-brand';
import {page as jsonClonePage} from './json-clone';
import {page as jsonEqualPage} from './json-equal';
import {page as jsonPatchPage} from './json-patch';
import {page as jsonPointerPage} from './json-pointer';
import {page as jsonRandomPage} from './json-random';
import {page as jsonSizePage} from './json-size';

export const page: LibPage = {
  name: 'json-joy',
  title: 'json-joy JavaScript',
  type: 'lib',
  subtitle: 'Reference implementation of JSON CRDT and other collaborative editing utilities.',
  about: 'json-joy implementation of JSON CRDT in TypeScript, JSON Patch and other JSON utilities in TypeScript / JavaScript.',
  slug: 'json-joy-js',
  libId: 'json-joy',
  pkg: 'json-joy',
  repo: 'streamich/json-joy',
  repoPath: 'tree/master/packages/json-joy',
  tech: 'TypeScript',
  techIcon: {set: 'lineicons', icon: 'typescript'},
  showInMenu: true,
  children: [
    gettingStartedPage,
    jsonCrdtPage,
    jsonCrdtPatchPage,
    jsonPackPage,
    jsonPatchPage,
    jsonPointerPage,
    jsonBinaryPage,
    jsonEqualPage,
    jsonClonePage,
    jsonRandomPage,
    jsonSizePage,
    jsonBrandPage,
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
