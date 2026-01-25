import type {ContentPage} from 'nice-ui/lib/6-page/DocsPages/types';

export const themingPage: ContentPage = {
  name: 'Theming',
  children: [],
  src: async () => (await import('!!raw-loader!./text.md')).default,
};
