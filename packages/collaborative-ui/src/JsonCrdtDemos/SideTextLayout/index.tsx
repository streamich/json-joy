import * as React from 'react';
import {Text} from 'nice-ui/lib/1-inline/Text';
import {FixedColumn} from 'nice-ui/lib/3-list-item/FixedColumn';
import useWindowSize from 'react-use/lib/useWindowSize';

export interface SideTextLayoutProps {
  title?: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
}

export const SideTextLayout: React.FC<SideTextLayoutProps> = ({title, left, right}) => {
  const {width} = useWindowSize();

  const isSmall = width < 800;

  return (
    <FixedColumn left={256} stack={isSmall}>
      <div style={{padding: '0 48px 0 0'}}>
        {!!title && <Text as={'h2'}>{title}</Text>}
        {left}
      </div>
      <div>{right}</div>
    </FixedColumn>
  );
};
