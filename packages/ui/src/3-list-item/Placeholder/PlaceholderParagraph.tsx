import * as React from 'react';
import {rule} from 'nano-theme';

const paragraphClass = rule({
  d: 'block',
});

export interface PlaceholderParagraphProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const PlaceholderParagraph: React.FC<PlaceholderParagraphProps> = ({style, children}) => (
  <span className={paragraphClass} style={style}>
    {children}
  </span>
);
