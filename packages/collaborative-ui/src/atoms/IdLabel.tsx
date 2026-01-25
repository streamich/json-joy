import * as React from 'react';
import {Code} from 'nice-ui/lib/1-inline/Code';

export interface IdLabelProps {
  children: React.ReactNode;
}

export const IdLabel: React.FC<IdLabelProps> = ({children}) => {
  return (
    <Code size={-1} nowrap noBg alt>
      {children}
    </Code>
  );
};
