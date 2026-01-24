import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  d: 'flex',
  flexWrap: 'nowrap',
  cur: 'pointer',
});

export interface Props {
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler;
}

export const LabelLayout: React.FC<Props> = (props) => {
  const {className = '', icon, children, onClick} = props;

  return (
    <div className={className + blockClass} onClick={onClick}>
      {icon}
      {children}
    </div>
  );
};
