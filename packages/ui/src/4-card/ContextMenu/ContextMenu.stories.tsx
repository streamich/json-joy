import * as React from 'react';
import {ContextMenu, StatefulContextMenu, ContextMenuState} from '.';
import type {Meta, StoryObj} from '@storybook/react';
import {Popup} from '../Popup';
import {BasicButtonMore} from '../../2-inline-block/BasicButton/BasicButtonMore';
import * as menuItems from './__stories__/menuItems';

const meta: Meta<typeof ContextMenu> = {
  title: '4. Card/ContextMenu/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    inset: true,
    pane: {
      style: {
        width: 300,
      },
    },
    menu: {
      name: 'Test',
      children: [
        {
          name: 'Item 1',
          onSelect: () => {},
        },
        {
          name: 'Item 2',
          onSelect: () => {},
        },
      ],
    },
  },
};

export const RichTextInline: StoryObj<typeof meta> = {
  args: {
    inset: true,
    pane: {
      style: {
        width: 242,
      },
    },
    menu: menuItems.inlineText,
  },
};

export const RichTextInline2: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  args: {
    inset: true,
    showSearch: true,
    pane: {
      style: {
        width: 242,
      },
    },
    menu: menuItems.inlineText,
  },
  decorators: [
    (Story) => (
      <div style={{padding: 32}}>
        <Story />
      </div>
    ),
  ],
};

const InlineTextPopup: React.FC = () => {
  return (
    <Popup
      tooltip={{
        nowrap: true,
        renderTooltip: () => 'More options',
      }}
      renderContext={() => (
        <ContextMenu
          inset
          showSearch
          pane={{
            style: {
              width: 242,
            },
          }}
          menu={menuItems.inlineText}
        />
      )}
    >
      <BasicButtonMore />
    </Popup>
  );
};

const BlockElementPopup: React.FC = () => {
  return (
    <Popup
      tooltip={{
        nowrap: true,
        renderTooltip: () => 'More options',
      }}
      renderContext={() => (
        <ContextMenu
          inset
          showSearch
          pane={{
            style: {
              width: 242,
            },
          }}
          menu={menuItems.blockElement}
        />
      )}
    >
      <BasicButtonMore />
    </Popup>
  );
};

interface DemoInteractiveProps {
  renderPopup: () => React.ReactNode;
}

const DemoInteractive: React.FC<DemoInteractiveProps> = ({renderPopup}) => {
  return (
    <div style={{padding: 32, boxSizing: 'border-box', width: '100vw', height: '180vh', position: 'relative'}}>
      <div style={{position: 'absolute', top: 32, left: 32}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: 32, left: 'calc(50% - 64px)'}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: 32, left: '50%'}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: 32, right: 32}}>{renderPopup()}</div>

      <div style={{position: 'absolute', top: '25%', left: 32}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: '25%', left: 'calc(50% - 64px)'}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: '25%', left: '50%'}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: '25%', right: 32}}>{renderPopup()}</div>

      <div style={{position: 'absolute', top: '50%', left: 32}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: '50%', left: 'calc(50% - 64px)'}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: '50%', left: '50%'}}>{renderPopup()}</div>
      <div style={{position: 'absolute', top: '50%', right: 32}}>{renderPopup()}</div>

      <div style={{position: 'absolute', bottom: 32, left: 32}}>{renderPopup()}</div>
      <div style={{position: 'absolute', bottom: 32, right: 32}}>{renderPopup()}</div>
    </div>
  );
};

export const MenuInlineText: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  render: () => <DemoInteractive renderPopup={() => <InlineTextPopup />} />,
};

export const BlockElement: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  args: {
    inset: true,
    pane: {
      style: {
        width: 242,
      },
    },
    menu: menuItems.blockElement,
  },
  decorators: [
    (Story) => (
      <div style={{padding: 32}}>
        <Story />
      </div>
    ),
  ],
};

export const MenuBlockElement: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  render: () => <DemoInteractive renderPopup={() => <BlockElementPopup />} />,
};

const WithExternalState: React.FC<{}> = () => {
  const state = React.useMemo(
    () => new ContextMenuState(menuItems.blockElement, {menu: menuItems.blockElement, inset: true}),
    [],
  );
  return <StatefulContextMenu state={state} />;
};

export const ExternalState: StoryObj<typeof meta> = {
  parameters: {
    layout: 'default',
  },
  render: () => <WithExternalState />,
};
