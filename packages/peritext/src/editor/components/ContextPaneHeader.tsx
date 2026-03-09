import * as React from 'react';
import {ContextHeader} from './ContextHeader';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {BasicButtonBack} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonBack';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';

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
  const [t] = useT();

  let element = (
    <Flex style={{alignItems: 'center'}}>
      {!!onBackClick && (
        <>
          <BasicTooltip renderTooltip={() => t('Back')}>
            <BasicButtonBack onClick={onBackClick} />
          </BasicTooltip>
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
          {!!onCloseClick && !!right && <Space horizontal />}
          {right}
        </Flex>
      </Split>
    );
  }

  return (
    <ContextHeader style={{padding: short ? '8px 8px 8px 16px' : '16px', borderRadius: '8px 8px 0 0'}}>
      {element}
    </ContextHeader>
  );
};
