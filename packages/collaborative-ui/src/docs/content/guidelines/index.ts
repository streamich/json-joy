import type {ContentPage} from '@jsonjoy.com/ui/lib/6-page/DocsPages/types';
import {gettingStartedPage} from './getting-started';
import {routingPage} from './routing';
import {themingPage} from './theming';
import {translationsPage} from './translations';

export const guidelinesPage: ContentPage = {
  name: 'Guidelines',
  slug: 'guidelines',
  showInMenu: true,
  showContentsTable: true,
  children: [gettingStartedPage, themingPage, routingPage, translationsPage],
  // src: async () => '',
};
