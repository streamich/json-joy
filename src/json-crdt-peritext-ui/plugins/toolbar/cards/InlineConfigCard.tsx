import * as React from 'react';
import type {SliceConfigState} from '../../../../json-crdt-extensions/peritext/editor/types';

export interface InlineConfigCardProps {
  config: SliceConfigState<any>;
}

export const InlineConfigCard: React.FC<InlineConfigCardProps> = ({}) => {
  
  return (
    <div>
      INLINE CONFIG
    </div>
  );
};
