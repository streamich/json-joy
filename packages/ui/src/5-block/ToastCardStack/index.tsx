import * as React from 'react';
import {Space} from '../../3-list-item/Space';
import {ZINDEX} from '../../constants';

export interface ToastCardStackProps {
  right?: boolean;
  bottom?: boolean;
  global?: boolean;
  children: React.ReactNode[];
}

export const ToastCardStack: React.FC<ToastCardStackProps> = ({right, bottom, global, children}) => {
  const list: React.ReactNode[] = [];
  const length = children.length;
  for (let i = 0; i < length; i++) {
    const item = children[i];
    if (!item) continue;
    list.push(<div key={i}>{item}</div>);
    const isLast = i === length - 1;
    if (!isLast) list.push(<Space key={'space-' + i} />);
  }

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: bottom ? 'column-reverse' : 'column',
    alignItems: right ? 'flex-end' : 'flex-start',
  };

  if (global) {
    style.position = 'fixed';
    style.zIndex = ZINDEX.TOAST;
    style[right ? 'right' : 'left'] = 16;
    style[bottom ? 'bottom' : 'top'] = 16;
  }

  return <div style={style}>{list}</div>;
};
