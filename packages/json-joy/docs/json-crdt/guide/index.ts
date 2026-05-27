import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as whyUsePage} from './why-json-crdt';
import {page as gettingStartedPage} from './getting-started';
import {page as nodeTypesPage} from './node-types';
import {page as usingWithTypescriptPage} from './using-with-typescript';
import {page as concurrentUsersPage} from './concurrent-users';
import {page as reactivityAndEventsPage} from './reactivity-and-events';
import {page as serializationPage} from './serialization';
// import {page as designInternalsPage} from './design-internals';

export const page: ContentPage = {
  name: 'Guide',
  children: [
    whyUsePage,
    gettingStartedPage,
    nodeTypesPage,
    usingWithTypescriptPage,
    concurrentUsersPage,
    reactivityAndEventsPage,
    serializationPage,
    // designInternalsPage,
  ],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
  showContentsTable: true,
};
