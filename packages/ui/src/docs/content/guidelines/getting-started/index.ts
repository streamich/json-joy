import type {ContentPage} from '../../../../6-page/DocsPages/types';

export const gettingStartedPage: ContentPage = {
  name: 'Getting started',
  children: [],
  src: async () => (await import('!!raw-loader!./text.md')).default,
};
