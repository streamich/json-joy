import * as React from 'react';
import TwoColumnLayout from '.';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof TwoColumnLayout> = {
  title: '5. Block/TwoColumnLayout',
  component: TwoColumnLayout,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const NarrowContent: StoryObj<typeof meta> = {
  args: {
    left: <div style={{border: '1px solid red', width: '100%'}}>Left</div>,
    right: <div style={{border: '1px solid red', width: '100%', overflow: 'auto'}}>Right</div>,
  },
};

export const WideContent: StoryObj<typeof meta> = {
  args: {
    left: (
      <div style={{border: '1px solid red', width: '100%', overflow: 'auto'}}>
        Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_Left_
      </div>
    ),
    right: (
      <div style={{border: '1px solid red', width: '100%', overflow: 'auto'}}>
        {
          'Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_Right_'
        }
      </div>
    ),
  },
};
