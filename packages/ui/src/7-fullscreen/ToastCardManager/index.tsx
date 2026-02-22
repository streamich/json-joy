import * as React from 'react';
import {useToasts} from './context';
import {useBehaviorSubject} from '../../hooks/useBehaviorSubject';
import {ToastCardStack} from '../../5-block/ToastCardStack';
import {ToastCard} from '../../4-card/ToastCard';
import useInterval from 'react-use/lib/useInterval';
import {fadeOutScaleClass} from '../../misc/css-animations';
import type {ToastItem} from './services/ToastItem';
import type {ToastStack} from './services/ToastStack';

export interface ToastCardItemProps {
  item: ToastItem;
}

export const ToastCardItem: React.FC<ToastCardItemProps> = ({item}) => {
  const [hovered, setHovered] = React.useState(false);
  const durationConsumed = useBehaviorSubject(item.durationConsumed$);
  const softDeletedTime = useBehaviorSubject(item.softDeletedTime$);
  useInterval(() => {
    if (!hovered) item.consume(50);
  }, 50);
  const progress = item.opts.duration ? durationConsumed / item.opts.duration : undefined;

  return (
    <div
      className={softDeletedTime ? fadeOutScaleClass : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ToastCard
        type={item.opts.type ?? ''}
        title={item.opts.title}
        message={item.opts.message}
        progress={progress}
        glow={!hovered}
        onClose={() => {
          item.remove();
        }}
      />
    </div>
  );
};

export interface ToastCardItemsProps {
  stack: ToastStack;
  right?: boolean;
  bottom?: boolean;
}

export const ToastCardItems: React.FC<ToastCardItemsProps> = ({stack, right, bottom}) => {
  const list = useBehaviorSubject(stack.stack$);

  if (!list || !list.length) return null;

  const elements: React.ReactNode[] = [];

  list.forEach((toast) => {
    if (toast.softDeletedTime$.getValue()) return;
    elements.push(<ToastCardItem key={toast.opts.id} item={toast} />);
  });

  return (
    <ToastCardStack global right={right} bottom={bottom}>
      {elements}
    </ToastCardStack>
  );
};

export type ToastCardManagerProps = {};

export const ToastCardManager: React.FC<ToastCardManagerProps> = () => {
  const toasts = useToasts();

  return (
    <>
      <ToastCardItems stack={toasts.topLeft} />
      <ToastCardItems stack={toasts.topRight} right />
      <ToastCardItems stack={toasts.bottomLeft} bottom />
      <ToastCardItems stack={toasts.bottomRight} right bottom />
    </>
  );
};
