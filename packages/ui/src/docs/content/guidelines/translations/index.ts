import type {ContentPage} from '../../../../6-page/DocsPages/types';

export const translationsPage: ContentPage = {
  name: 'Translations',
  children: [],
  src: async () => (await import('!!raw-loader!./text.md')).default,
};
