import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as contributingPage} from './contributing';

export const page: ContentPage = {
  name: 'Getting started',
  children: [contributingPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
};
