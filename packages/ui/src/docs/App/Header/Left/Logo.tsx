import * as React from 'react';
import {LogoStatic} from '../../../../1-inline/LogoStatic';
import {Text} from '../../../../1-inline/Text';
import {Link} from '../../../../1-inline/Link';
import {FixedColumn} from '../../../../3-list-item/FixedColumn';

export type Props = {};

export const Logo: React.FC<Props> = () => {
  return (
    <Link a to={'/'} style={{borderRadius: 4, padding: 4}}>
      <FixedColumn as="span" left={42} style={{alignItems: 'center', marginLeft: -10}}>
        <LogoStatic colors="red" variant="round" size={36} />
        <span style={{padding: '0 4px 0 0', letterSpacing: '-0.05em'}}>
          <Text size={2} nowrap font={'ui2'} kind={'black'}>
            Nice UI
          </Text>
        </span>
      </FixedColumn>
    </Link>
  );
};
