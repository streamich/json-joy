// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import {Portal} from '../../../components/Portal';
import {usePeritext} from '../context';

export interface EditorPortalProps {
  children: React.ReactNode;
}

export const EditorPortal: React.FC<EditorPortalProps> = ({children}) => {
  const state = usePeritext();

  return <Portal parent={state.portalEl}>{children}</Portal>;
};
