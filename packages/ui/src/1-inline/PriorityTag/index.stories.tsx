import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {PriorityTag as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/PriorityTag',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    level: {control: 'select', options: ['urgent', 'high', 'medium', 'low']},
    priority: {control: {type: 'range', min: 0, max: 1, step: 0.01}},
    label: {control: 'text'},
    plain: {control: 'boolean'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {level: 'high', label: 'High'},
};

/** All four levels — a directional glyph (⌃⌃ urgent · ⌃ high · — medium · ⌄ low)
 * on a soft tint of the level color. */
export const Levels: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component level="urgent" label="Urgent" />
      <Component level="high" label="High" />
      <Component level="medium" label="Medium" />
      <Component level="low" label="Low" />
    </div>
  ),
};

/** Glyph only, no label. */
export const IconOnly: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component level="urgent" />
      <Component level="high" />
      <Component level="medium" />
      <Component level="low" />
    </div>
  ),
};

/** Opt into the continuous `priority` scale (`0` ... `1`): a donut fills to the
 * value and is toned by the band it lands in. */
export const Continuous: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component priority={0.1} label="0.1" />
      <Component priority={0.35} label="0.35" />
      <Component priority={0.6} label="0.6" />
      <Component priority={0.9} label="0.9" />
      <Component priority={1} label="1.0" />
    </div>
  ),
};

/** `plain` drops the pill background for dense inline use. */
export const Plain: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component plain level="urgent" label="Urgent" />
      <Component plain level="high" label="High" />
      <Component plain level="medium" label="Medium" />
      <Component plain level="low" label="Low" />
    </div>
  ),
};
