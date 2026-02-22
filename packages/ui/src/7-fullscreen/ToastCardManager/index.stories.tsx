import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {useToasts} from './context';
import {Space} from '../../3-list-item/Space';
import {Checkbox} from '../../2-inline-block/Checkbox';

const meta: Meta<typeof Demo> = {
  title: '7. Fullscreen/ToastCardManager',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type DemoProps = {};

const Demo: React.FC<DemoProps> = () => {
  const toasts = useToasts();
  const [title, setTitle] = React.useState('Hi, there!');
  const [message, setMessage] = React.useState(
    'This is a message. This message is very important. Please read it carefully.',
  );
  const [right, setRight] = React.useState(false);
  const [bottom, setBottom] = React.useState(false);

  const handleClick = () => {
    toasts.add({
      right,
      bottom,
      title,
      message,
      duration: 5000,
    });
  };

  return (
    <div>
      <button type="button" onClick={handleClick}>
        Top left
      </button>
      <Space />
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Space />
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <Space />
      Right: <Checkbox small on={right} onChange={() => setRight((x) => !x)} />
      <Space />
      Bottom: <Checkbox small on={bottom} onChange={() => setBottom((x) => !x)} />
    </div>
  );
};

export const Primary: StoryObj<typeof meta> = {
  render: () => <Demo />,
};
