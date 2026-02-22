import * as React from 'react';
import {IconsSetGrid} from '../IconsSetGrid';
import {useStyles} from '../../../../../../styles/context';

export interface IconsRightProps {
  steps: string[];
}

export const IconsRight: React.FC<IconsRightProps> = ({steps}) => {
  const styles = useStyles();

  switch (steps[0]) {
    case 'all':
      return <div style={{color: styles.col.accent()}}>All</div>;
    case 'browse':
      if (!steps[1]) return <div>no set picked</div>;
      return <IconsSetGrid key={steps[1]} set={steps[1]} />;
    default:
      return null;
  }
};
