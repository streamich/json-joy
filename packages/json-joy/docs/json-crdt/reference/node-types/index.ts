import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as conPage} from './con';
import {page as valPage} from './val';
import {page as objPage} from './obj';
import {page as vecPage} from './vec';
import {page as strPage} from './str';
import {page as binPage} from './bin';
import {page as arrPage} from './arr';

export const page: ContentPage = {
  name: 'Node types',
  slug: 'node-types',
  children: [conPage, valPage, objPage, vecPage, strPage, binPage, arrPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
  showContentsTable: true,
};
