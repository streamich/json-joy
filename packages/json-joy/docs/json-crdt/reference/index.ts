import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as documentModelPage} from './document-model';
import {page as nodeTypesPage} from './node-types';

export const page: ContentPage = {
  name: 'Reference',
  children: [documentModelPage, nodeTypesPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
  showContentsTable: true,
};
