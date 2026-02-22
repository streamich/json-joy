import * as React from 'react';
import {rule} from 'nano-theme';
import {context} from '../context';

const {createElement: h, useContext} = React;

export const mdBlockClass = rule({
  '&+&': {
    mart: '2em',
    marb: 0,
  },
});

export const mdBlockCompactClass = rule({
  '&+&': {
    mart: '0.8em',
    marb: 0,
  },
});

export const mdBlockNotLooseClass = rule({
  [`.${mdBlockClass.trim()}+&`]: {
    mart: 0,
    marb: 0,
  },
});

interface Props {
  idx: number;
  as?: string;
  notLoose?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler;
}

const MarkdownBlock: React.FC<Props> = ({as = 'div', notLoose, className = '', style, children, onClick}) => {
  const {props} = useContext(context);

  return h(
    as,
    {
      className:
        className +
        mdBlockClass +
        (props.isCompact ? mdBlockCompactClass : '') +
        (notLoose ? mdBlockNotLooseClass : ''),
      'data-testid': 'MarkdownBlock',
      style,
      onClick,
    },
    children,
  );
};

export default MarkdownBlock;
