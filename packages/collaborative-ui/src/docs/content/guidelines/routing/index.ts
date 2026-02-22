import type {ContentPage} from '@jsonjoy.com/ui/lib/6-page/DocsPages/types';

export const routingPage: ContentPage = {
  name: 'Routing',
  children: [],
  src: async () => (await import('!!raw-loader!./text.md')).default,
};
