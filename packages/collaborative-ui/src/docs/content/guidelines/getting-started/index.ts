import type {ContentPage} from 'nice-ui/lib/6-page/DocsPages/types';

export const gettingStartedPage: ContentPage = {
  name: 'Getting started',
  children: [],
  src: async () => (await import('!!raw-loader!./text.md')).default,
};
