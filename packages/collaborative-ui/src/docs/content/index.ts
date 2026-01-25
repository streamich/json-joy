import type {ContentPage} from './types';
import {augmentContentPages} from '@jsonjoy.com/ui/lib/6-page/DocsPages/util';
import {componentsPage} from './components';
import {guidelinesPage} from './guidelines';

const content: ContentPage = {
  name: 'Home',
  slug: '',
  steps: [],
  children: [
    {
      name: 'Live demos',
      slug: 'demos',
      showInMenu: true,
    },
    {
      name: 'Explorer',
      slug: 'explorer',
      showInMenu: true,
      showContentsTable: true,
    },
    guidelinesPage,
    componentsPage,
  ],
};

augmentContentPages(content);

export {content};
