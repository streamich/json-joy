import type {ContentPage} from '../../../6-page/DocsPages/types';

export const componentsPage: ContentPage = {
  name: 'Components',
  slug: 'components',
  showInMenu: true,
  showContentsTable: true,
  children: [
    {
      name: 'Inline',
      title: 'Inline components',
      showContentsTable: true,
      src: async () => (await import('!!raw-loader!./inline/text.md')).default,
      children: [
        {
          name: 'Avatar',
          title: 'The `<Avatar>` component',
          src: async () => (await import('!!raw-loader!./inline/avatar/text.md')).default,
          children: [],
        },
      ],
    },
    {
      name: 'Inline block',
      title: 'Inline block components',
      showContentsTable: true,
      src: async () => (await import('!!raw-loader!./inline-block/text.md')).default,
      children: [],
    },
    {
      name: 'List item',
      title: 'List item components',
      showContentsTable: true,
      src: async () => (await import('!!raw-loader!./list-item/text.md')).default,
      children: [],
    },
    {
      name: 'Card',
      title: 'Card components',
      showContentsTable: true,
      src: async () => (await import('!!raw-loader!./card/text.md')).default,
      children: [],
    },
    {
      name: 'Block',
      title: 'Block components',
      showContentsTable: true,
      src: async () => (await import('!!raw-loader!./block/text.md')).default,
      children: [],
    },
    {
      name: 'Page',
      title: 'Page components',
      showContentsTable: true,
      src: async () => (await import('!!raw-loader!./page/text.md')).default,
      children: [],
    },
    {
      name: 'Fullscreen',
      title: 'Fullscreen components',
      showContentsTable: true,
      src: async () => (await import('!!raw-loader!./fullscreen/text.md')).default,
      children: [],
    },
  ],
};
