import * as React from 'react';
import {Avatar} from '../../../../1-inline/Avatar';
import {FixedColumn} from '../../../../3-list-item/FixedColumn';
import {CommandParameter} from '../CommandParameter';

export interface Props {
  label?: React.ReactNode;
  value: string;
  active?: boolean;
}

export const Parameter: React.FC<Props> = ({label, value, active}) => {
  return (
    <FixedColumn right={28}>
      <div>
        <CommandParameter value={value} label={label} active={active} />
      </div>
      <div>
        <div style={{padding: '0 4px 0 6px'}}>
          <Avatar color={value} rounded square width={18} />
        </div>
      </div>
    </FixedColumn>
  );
};
