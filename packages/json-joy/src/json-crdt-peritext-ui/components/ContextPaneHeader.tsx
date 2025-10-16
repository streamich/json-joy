import * as React from 'react';
import {ContextHeader} from './ContextHeader';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {BasicButtonBack} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonBack';
import {BasicButtonClose} from 'nice-ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {Flex} from 'nice-ui/lib/3-list-item/Flex';
import {Split} from 'nice-ui/lib/3-list-item/Split';

export interface ContextPaneHeaderProps {
  short?: boolean;
  right?: React.ReactNode;
  children?: React.ReactNode;
  onBackClick?: React.MouseEventHandler;
  onCloseClick?: React.MouseEventHandler;
}

export const ContextPaneHeader: React.FC<ContextPaneHeaderProps> = ({
  short,
  right,
  children,
  onBackClick,
  onCloseClick,
}) => {
  let element = (
    <Flex style={{alignItems: 'center'}}>
      {!!onBackClick && (
        <>
          <BasicButtonBack onClick={onBackClick} />
          <Space horizontal />
          {/* <Space horizontal size={-1} /> */}
        </>
      )}
      {children}
    </Flex>
  );

  if (onCloseClick || right) {
    element = (
      <Split style={{alignItems: 'center'}}>
        {element}
        <Flex style={{flexDirection: 'row-reverse'}}>
          {!!onCloseClick && <BasicButtonClose onClick={onCloseClick} />}
          {right}
        </Flex>
      </Split>
    );
  }

  return (
    <ContextHeader style={{padding: short ? '12px 16px' : '16px', borderRadius: '8px 8px 0 0'}}>
      {element}
    </ContextHeader>
  );
};
