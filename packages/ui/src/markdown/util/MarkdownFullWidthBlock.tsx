import * as React from 'react';
import {rule} from 'nano-theme';

const wrapClass = rule({
  maxW: 780 + 'px',
  pad: '0 16px',
  mar: '0 auto',
});

const wrapWideClass = rule({
  maxW: '1080px',
});

const wrapXWideClass = rule({
  maxW: '1400px',
});

const extraPaddingClass = rule({
  pad: '0 32px',
});

const fullWidthClass = rule({
  maxW: '100%',
  pad: '0',
});

export const mdBlockClass = rule({
  '&+&': {
    mar: '32px 0 0',
  },
});

export const mdBlockCompactClass = rule({
  '&+&': {
    mar: '8px 0 0',
  },
});

interface Props {
  wide?: boolean;
  xwide?: boolean;
  full?: boolean;
  padding?: boolean;
  children: React.ReactNode;
}

const MarkdownFullWidthBlock: React.FC<Props> = ({wide, xwide, full, padding, children}) => {
  return (
    <div className={mdBlockClass}>
      <div
        className={
          wrapClass +
          (wide ? wrapWideClass : '') +
          (xwide ? wrapXWideClass : '') +
          (full ? fullWidthClass : '') +
          (padding ? extraPaddingClass : '')
        }
      >
        {children}
      </div>
    </div>
  );
};

export default MarkdownFullWidthBlock;
