import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {Reaction as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/Reaction',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    emoji: {control: 'text'},
    count: {control: 'number'},
    active: {control: 'boolean'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {emoji: '👍', count: 4, onToggle: () => {}},
};

/** The current user has reacted — filled with a soft accent tint. */
export const Active: Story = {
  args: {emoji: '🎉', count: 12, active: true, onToggle: () => {}},
};

/** Emoji with no count. */
export const NoCount: Story = {
  args: {emoji: '❤️', onToggle: () => {}},
};

/** A row of reactions, as it appears under a message. */
export const Row: Story = {
  render: () => {
    const Bar: React.FC = () => {
      const [active, setActive] = React.useState<string | null>('🚀');
      const toggle = (e: string) => () => setActive((a) => (a === e ? null : e));
      return (
        <div style={{display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap'}}>
          <Component emoji="👍" count={8} active={active === '👍'} onToggle={toggle('👍')} />
          <Component emoji="🚀" count={5} active={active === '🚀'} onToggle={toggle('🚀')} />
          <Component emoji="🎉" count={3} active={active === '🎉'} onToggle={toggle('🎉')} />
          <Component emoji="👀" count={1} active={active === '👀'} onToggle={toggle('👀')} />
        </div>
      );
    };
    return <Bar />;
  },
};
