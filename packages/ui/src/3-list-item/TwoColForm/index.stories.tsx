import * as React from 'react';
import {TwoColFormRow, TwoColFormTitle} from '.';
import Paper from '../../4-card/Paper';
import {Iconista} from '../../icons/Iconista';
import {Pill} from '../../1-inline/Pill';
import {Dot} from '../../1-inline/Dot';
import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {rule} from 'nano-theme';

export interface TwoColFormProps {
  /** Rows, titles, separators, or any other content. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const Component: React.FC<TwoColFormProps> = ({children, style}) => {
  return (
    <div className={blockClass} style={style}>
      {children}
    </div>
  );
};

const meta: Meta<typeof Component> = {
  title: '3. List Item/TwoColForm',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

const blockClass = rule({
  d: 'block',
  w: '100%',
  bxz: 'border-box',
});

const Wrap: React.FC<{children: React.ReactNode}> = ({children}) => (
  <Paper style={{padding: 24, width: 360}}>{children}</Paper>
);

const Chevron: React.FC = () => <span style={{opacity: 0.5, marginLeft: 4, fontSize: 11}}>{'⌄'}</span>;

export const Primary: StoryObj<typeof meta> = {
  render: () => (
    <Wrap>
      <Component>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="info-circle" width={16} height={16} />} title="Status">
          <Pill color="positive">
            <Dot color="positive" />
            Active
          </Pill>
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />} title="Next run">
          <Pill>Tomorrow at 09:00</Pill>
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />} title="Last ran">
          <Pill>Today at 09:15</Pill>
        </TwoColFormRow>
      </Component>
    </Wrap>
  ),
};

export const Sectioned: StoryObj<typeof meta> = {
  render: () => (
    <Wrap>
      <Component>
        <TwoColFormTitle>Status</TwoColFormTitle>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="info-circle" width={16} height={16} />} title="Status">
          <Pill color="positive">
            <Dot color="positive" />
            Active
          </Pill>
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />} title="Next run">
          <Pill>Tomorrow at 09:00</Pill>
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />} title="Last ran">
          <Pill>Today at 09:15</Pill>
        </TwoColFormRow>

        <div style={{height: 12}} />
        <TwoColFormTitle>Details</TwoColFormTitle>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />} title="Type">
          <span style={{opacity: 0.55}}>
            <Iconista set="bootstrap" icon="clock" width={12} height={12} />
          </span>
          Cron job
          <Chevron />
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="display" width={16} height={16} />} title="Runs in">
          Worktree
          <Chevron />
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="folder" width={16} height={16} />} title="Folder">
          automations
          <Chevron />
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />} title="Repeats">
          Daily at 10:00
          <Chevron />
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="bootstrap" icon="box" width={16} height={16} />} title="Model">
          GPT-5.4
          <Chevron />
        </TwoColFormRow>
        <TwoColFormRow icon={<Iconista set="ant_outline" icon="bulb" width={16} height={16} />} title="Reasoning">
          Medium
          <Chevron />
        </TwoColFormRow>
      </Component>
    </Wrap>
  ),
};
