import * as React from 'react';
import type { Preview } from '@storybook/react-webpack5'
import { useGlobals } from 'storybook/preview-api';
import { NiceUiProvider } from '../packages/ui/src/context';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
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
};

export default preview;