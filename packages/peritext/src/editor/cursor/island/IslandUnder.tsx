import * as React from 'react';
import {FormattingsManagePane} from '../../inline/FormattingsManagePane';
import {BottomPanePortal} from '../util/BottomPanePortal';
import {IslandProps} from './Island';

export interface IslandUnderProps extends IslandProps {
  selected?: boolean;
}

export const IslandUnder: React.FC<IslandUnderProps> = (props) => {
  const {inline, selected} = props;

  if (!inline || !selected) return;

  return (
    <BottomPanePortal>
      <FormattingsManagePane inline={inline} />
    </BottomPanePortal>
  );
};
