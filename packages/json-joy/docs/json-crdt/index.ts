import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as guidePage} from './guide';
import {page as referencePage} from './reference';
import {page as extensionsPage} from './extensions';
import {page as benchmarksPage} from './benchmarks';

export const page: ContentPage = {
  name: 'json-crdt',
  subtitle: 'Conflict-free replicated JSON data types',
  slug: 'json-crdt',
  children: [guidePage, referencePage, extensionsPage, benchmarksPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
  showContentsTable: true,
};
