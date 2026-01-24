import * as React from 'react';
import {StatefulToolbarMenu, ToolbarMenu} from './ToolbarMenu';
import * as menuItems from '../ContextMenu/__stories__/menuItems';
import {rule} from 'nano-theme';
import {CaretToolbar, type CaretToolbarProps} from './ToolbarMenu/CaretToolbar';
import type {Meta, StoryObj} from '@storybook/react';
import {ToolbarMenuState} from './ToolbarMenu/state';
import type {ToolbarMenuProps} from './ToolbarMenu/types';
import {ToolbarItem} from './ToolbarItem';
import {MoveToViewport} from '../../utils/popup/MoveToViewport';

const meta: Meta<typeof ToolbarMenu> = {
  title: '4. Card/Toolbar/ToolbarMenu',
  component: ToolbarMenu,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const RichTextInline: StoryObj<typeof meta> = {
  args: {
    menu: menuItems.inlineText,
  },
};

const blockClass = rule({
  pos: 'relative',
  w: '0px',
  h: '100%',
  bg: 'black',
  va: 'bottom',
});

const overClass = rule({
  pos: 'absolute',
  b: '1.9em',
  l: 0,
  isolation: 'isolate',
  us: 'none',
  transform: 'translateX(calc(-50% + 0px))',
  // bd: '1px solid red',
  // w: '1px',
  // h: '1px',
});

const InlineTextFloatingMenuDemo: React.FC<Partial<CaretToolbarProps>> = (props) => {
  const [open, setOpen] = React.useState(true);

  const cursor = (
    <span
      className={blockClass}
      onClick={() => {
        if (!open) setOpen(true);
      }}
    >
      |
      <span className={overClass}>
        {open && (
          <MoveToViewport>
            <CaretToolbar menu={menuItems.inlineText} {...props} />
          </MoveToViewport>
        )}
      </span>
    </span>
  );

  return (
    <div style={{width: 560, margin: '100px auto'}}>
      This text has floating menu inside. Uploading tracks just got way easier: upload, get heard, and get paid in one
      seamless experience. Votre titre de transport à destination de Château-d'Oex vous permet d’obtenir une partie
      offerte {cursor} au Bowling de Château-d'Oex. Votre titre de transport à destination de Château-d'Oex vous permet
      d’obtenir une partie offerte au Bowling {cursor} de Château-d'Oex.
    </div>
  );
};

export const InlineTextFloatingMenu: StoryObj<typeof meta> = {
  render: () => (
    <InlineTextFloatingMenuDemo
      onClickAway={() => {
        console.log('click away');
      }}
    />
  ),
};

export const SmallMoreButton: StoryObj<typeof meta> = {
  render: () => (
    <InlineTextFloatingMenuDemo
      more={{
        small: true,
      }}
    />
  ),
};

export const CustomBeforeAndAfterElements: StoryObj<typeof meta> = {
  render: () => (
    <InlineTextFloatingMenuDemo
      before={
        <>
          <ToolbarItem>a</ToolbarItem>
          <ToolbarItem>b</ToolbarItem>
        </>
      }
      after={
        <>
          <ToolbarItem>c</ToolbarItem>
          <ToolbarItem>d</ToolbarItem>
        </>
      }
      more={{
        small: true,
      }}
    />
  ),
};

const ExternalStateDemo: React.FC<ToolbarMenuProps> = (props) => {
  const state = React.useMemo(() => new ToolbarMenuState(props), [props]);
  return <StatefulToolbarMenu {...props} state={state} />;
};

export const ExternalState: StoryObj<typeof meta> = {
  render: () => <ExternalStateDemo menu={menuItems.inlineText} />,
};

export const Disabled: StoryObj<typeof meta> = {
  render: () => <InlineTextFloatingMenuDemo disabled />,
};
