import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {StatusPill as Component} from '.';

const meta: Meta<typeof Component> = {
  title: '1. Inline/StatusPill',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tone: {control: 'select', options: ['success', 'warning', 'info', 'danger', 'accent', 'muted']},
    shape: {control: 'select', options: ['dot', 'ring', 'check', 'dash', 'donut', 'none']},
    label: {control: 'text'},
    progress: {control: {type: 'range', min: 0, max: 1, step: 0.01}},
    small: {control: 'boolean'},
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {tone: 'info', label: 'In Progress', shape: 'ring'},
};

/** The semantic tones. */
export const Tones: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component tone="success" label="Success" />
      <Component tone="warning" label="Warning" />
      <Component tone="info" label="Info" />
      <Component tone="danger" label="Danger" />
      <Component tone="accent" label="Accent" />
      <Component tone="muted" label="Muted" />
    </div>
  ),
};

/** The leading marker shapes. */
export const Shapes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component tone="muted" shape="dot" label="Backlog" />
      <Component tone="info" shape="ring" label="In Progress" />
      <Component tone="success" shape="check" label="Done" />
      <Component tone="muted" shape="dash" label="Cancelled" />
      <Component tone="accent" shape="none" label="No marker" />
    </div>
  ),
};

/** The `donut` shape shows a progress fraction in the tone color. */
export const Progress: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component tone="muted" shape="donut" progress={0} label="0%" />
      <Component tone="info" shape="donut" progress={0.25} label="25%" />
      <Component tone="info" shape="donut" progress={0.5} label="Halfway" />
      <Component tone="warning" shape="donut" progress={0.8} label="80%" />
      <Component tone="success" shape="donut" progress={1} label="Complete" />
    </div>
  ),
};

/** A typical issue-tracker workflow. */
export const Workflow: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component tone="muted" shape="dot" label="Todo" />
      <Component tone="info" shape="ring" label="In Progress" />
      <Component tone="warning" shape="dot" label="In Review" />
      <Component tone="success" shape="check" label="Done" />
      <Component tone="danger" shape="dash" label="Cancelled" />
    </div>
  ),
};

/** Compact variant for dense rows. */
export const Small: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
      <Component small tone="success" shape="check" label="Done" />
      <Component small tone="info" shape="ring" label="In Progress" />
      <Component small tone="muted" shape="dot" label="Backlog" />
    </div>
  ),
};
