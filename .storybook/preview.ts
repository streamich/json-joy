import * as React from 'react';
import { definePreview } from '@storybook/react-webpack5';
import { useGlobals } from 'storybook/preview-api';
import { UiProvider } from '../packages/ui/src/context';

const preview = definePreview({
  addons: [],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [],
        locales: 'en-US',
      },
    },
  },

  decorators: [
    (Story) => {
      const [globals] = useGlobals();
      const color = globals?.backgrounds?.value;
      const isDark = color === 'dark';
      return React.createElement(
        UiProvider,
        { theme: isDark ? 'dark' : 'light' } as any,
        React.createElement(Story)
      );
    },
  ],

  tags: ['autodocs'],
});

export default preview;