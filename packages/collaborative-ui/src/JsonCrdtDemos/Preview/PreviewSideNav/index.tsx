import * as React from 'react';
import {ShareBlock} from './ShareBlock';

export interface PreviewSideNavProps {
  id: string;
}

export const PreviewSideNav: React.FC<PreviewSideNavProps> = ({id}) => {
  return <ShareBlock id={id} />;
};
