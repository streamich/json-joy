import * as React from 'react';
import {Floater} from './index';
import {Doodle} from '../../5-block/Doodle';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

const meta: Meta<typeof Floater> = {
  title: 'Miscellaneous/Floater',
  component: Floater,
  parameters: {layout: 'centered'},
  tags: ['autodocs'],
  argTypes: {
    distance: {control: {type: 'range', min: 0, max: 60, step: 1}},
    duration: {control: {type: 'range', min: 1, max: 20, step: 0.5}},
    delay: {control: {type: 'range', min: -10, max: 0, step: 0.5}},
    blur: {control: {type: 'range', min: 0, max: 12, step: 0.5}},
    opacity: {control: {type: 'range', min: 0, max: 1, step: 0.05}},
    rotate: {control: {type: 'range', min: -180, max: 180, step: 1}},
    shiftX: {control: {type: 'range', min: -120, max: 120, step: 2}},
    shiftY: {control: {type: 'range', min: -120, max: 120, step: 2}},
    tiltX: {control: {type: 'range', min: -45, max: 45, step: 1}},
    tiltY: {control: {type: 'range', min: -45, max: 45, step: 1}},
    tz: {control: {type: 'range', min: -200, max: 0, step: 5}},
    float: {control: 'boolean'},
    sharpenOnHover: {control: 'boolean'},
    active: {control: 'boolean'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const Demo: React.FC = () => <Doodle segments={3} size={160} dim dimOpacity={1} brightenOnHover />;

export const Playground: Story = {
  args: {blur: 2, opacity: 0.55, rotate: -8, distance: 14, sharpenOnHover: true},
  render: (args) => (
    <Floater {...args}>
      <Demo />
    </Floater>
  ),
};

export const Depths: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 40, alignItems: 'center'}}>
      {[0, 0.4, 0.8].map((d) => (
        <Floater
          key={d}
          blur={0.5 + d * 3}
          opacity={0.55 - d * 0.3}
          rotate={d * 18 - 9}
          tiltX={d * 24}
          tiltY={d * -16}
          tz={-d * 140}
          duration={9 - d * 2}
          delay={-d * 4}
          sharpenOnHover
        >
          <Demo />
        </Floater>
      ))}
      <small style={{opacity: 0.6}}>hover any to bring it into focus</small>
    </div>
  ),
};

export const ShiftAndRotate: Story = {
  render: () => (
    <div style={{position: 'relative', width: 320, height: 200, border: '1px dashed #ccc'}}>
      <span style={{position: 'absolute', top: 8, left: 8}}>
        <Floater rotate={-20} shiftX={-10} opacity={0.7}>
          <Doodle segments={2} size={90} dim dimOpacity={1} brightenOnHover />
        </Floater>
      </span>
      <span style={{position: 'absolute', bottom: 0, right: 0}}>
        <Floater rotate={140} shiftX={12} shiftY={6} delay={-3} sharpenOnHover active>
          <Doodle segments={2} size={90} pattern="scallop" dim dimOpacity={1} brightenOnHover />
        </Floater>
      </span>
      <p style={{margin: 24, opacity: 0.6}}>Floaters attached to a card's corners.</p>
    </div>
  ),
};
