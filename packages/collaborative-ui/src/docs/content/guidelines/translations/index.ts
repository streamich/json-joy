import type {ContentPage} from 'nice-ui/lib/6-page/DocsPages/types';

export const translationsPage: ContentPage = {
  name: 'Translations',
  children: [],
  src: async () => (await import('!!raw-loader!./text.md')).default,
};
