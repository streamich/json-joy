import * as React from 'react';
import {Split} from 'nice-ui/lib/3-list-item/Split';
import {MiniTitle} from 'nice-ui/lib/3-list-item/MiniTitle';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {Space} from 'nice-ui/lib/3-list-item/Space';

export interface CardHeaderProps {
  title?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({title, left, right}) => {
  return (
    <Split style={{alignItems: 'center'}}>
      <Flex style={{alignItems: 'center'}}>
        {!!title && (
          <div style={{marginTop: -1}}>
            <MiniTitle>{title}</MiniTitle>
          </div>
        )}
        {!!title && <Space horizontal size={1} />}
        {left}
      </Flex>
      <div>{right}</div>
    </Split>
  );
};
