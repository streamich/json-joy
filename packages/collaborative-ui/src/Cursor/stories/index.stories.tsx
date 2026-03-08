import * as React from 'react';
import useThrottle from 'react-use/lib/useThrottle';
import {Cursor} from '..';
import {CursorIcon} from '../../CursorIcon';

export default {
  component: Cursor,
  title: '<Cursor>',
  tags: ['autodocs'],
};

export const Default = {
  args: {
    point: [0, 0],
    rel: 'element',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{width: 10, height: 10, position: 'relative'}}>
        <Story />
      </div>
    ),
  ],
};

export const HundredTwenty = {
  args: {
    point: [100, 20],
    rel: 'element',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{width: 200, height: 200, position: 'relative'}}>
        <Story />
      </div>
    ),
  ],
};

const FollowMouseDemo: React.FC = () => {
  const [point, setPoint] = React.useState<[x: number, y: number]>([0, 0]);
  React.useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      setPoint([event.clientX, event.clientY]);
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);
  const pointThrottled = useThrottle(point, 100);

  return (
    <div
      style={{
        margin: 32,
        padding: 32,
        background: '#eaeaea',
        borderRadius: 16,
        width: 300,
        textAlign: 'center',
        lineHeight: '200px',
      }}
    >
      <pre>
        x: {point[0]}, y: {point[1]}
      </pre>
      <Cursor point={[pointThrottled[0] + 20, pointThrottled[1] + 20]} />
    </div>
  );
};

export const FollowMouse = {
  args: {
    point: [0, 0],
  },
  decorators: [() => <FollowMouseDemo />],
};

export const Color = {
  args: {
    point: [0, 0],
    rel: 'element',
    icon: <CursorIcon color="red" />,
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{width: 10, height: 10, position: 'relative'}}>
        <Story />
      </div>
    ),
  ],
};
