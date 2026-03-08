import * as React from 'react';
import {rule} from 'nano-theme';
import {fonts} from '@jsonjoy.com/ui/lib/styles';
import {CopyButton} from '../CopyButton';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';

const textClass = rule({
  ...fonts.get('ui', 'bold', 1),
  d: 'inline-flex',
  ai: 'center',
  fz: '13px',
  maxW: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export interface TextCopyProps {
  text: React.ReactNode;
  copy: () => string;
}

export const TextCopy: React.FC<TextCopyProps> = ({text, copy}) => {
  return (
    <Flex style={{gap: '4px', alignItems: 'center'}}>
      <div className={textClass}>{text}</div>
      <CopyButton onCopy={copy} />
    </Flex>
  );
};
