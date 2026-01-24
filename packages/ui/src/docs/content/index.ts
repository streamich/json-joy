import type {ContentPage} from './types';
import {augmentContentPages} from '../../6-page/DocsPages/util';
import {componentsPage} from './components';
import {guidelinesPage} from './guidelines';

const content: ContentPage = {
  name: 'Home',
  slug: '',
  steps: [],
  children: [
    guidelinesPage,
    componentsPage,
    <ContentPage>{
      name: 'Icons',
      showInMenu: true,
      showContentsTable: true,
    },
    <ContentPage>{
      name: 'Theme',
      showInMenu: true,
      showContentsTable: true,
    },
  ],
};

augmentContentPages(content);

export {content};
