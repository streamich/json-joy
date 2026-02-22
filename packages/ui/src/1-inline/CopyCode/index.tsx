import * as React from 'react';
import {Code, type CodeProps} from '../Code';
import {Flex} from '../../3-list-item/Flex';
import {Space} from '../../3-list-item/Space';
import {CopyButton} from '../../2-inline-block/CopyButton';

export interface CopyCodeProps extends CodeProps {
  value: string;
}

export const CopyCode: React.FC<CopyCodeProps> = ({value, ...rest}) => {
  return (
    <Code
      gray
      spacious
      {...rest}
      onMouseDown={(event) => {
        try {
          const element = event.nativeEvent.target;
          if (!element) return;
          if (window.getSelection && document.createRange) {
            const selection = window.getSelection();
            if (!selection) return;
            event.preventDefault();
            const range = document.createRange();
            range.selectNodeContents(element as any);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch {}
      }}
    >
      <Flex style={{alignItems: 'center'}}>
        {value}
        <Space horizontal size={-1} />
        <CopyButton onCopy={() => value} />
      </Flex>
    </Code>
  );
};
