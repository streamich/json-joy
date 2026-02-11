import * as React from 'react';
import { definePreview } from '@storybook/react-webpack5';
import { useGlobals } from 'storybook/preview-api';
import { NiceUiProvider } from '../packages/ui/src/context';

const preview = definePreview({
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
      const isDark = color ? String(color)[1].toLowerCase() !== 'f' : false;
      return React.createElement(
        NiceUiProvider,
        { theme: isDark ? 'dark' : 'light' } as any,
        React.createElement(Story)
      );
    },
  ],

  tags: ['autodocs'],
});

export default preview;