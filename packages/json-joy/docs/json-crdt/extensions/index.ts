import type {ContentPage} from '@jsonjoy.com/ui/src/types/libs';
import {page as aboutExtensionsPage} from './about-extensions';
import {page as multiValueRegisterPage} from './multi-value-register';
import {page as counterRegisterPage} from './counter-register';
import {page as richTextPage} from './rich-text';

export const page: ContentPage = {
  name: 'Extensions',
  children: [aboutExtensionsPage, multiValueRegisterPage, counterRegisterPage, richTextPage],
  // @ts-ignore
  src: async () => (await import('./text.md')).default,
  showContentsTable: true,
};
