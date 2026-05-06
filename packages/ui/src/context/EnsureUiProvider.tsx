import * as React from 'react';
import {context} from './services';
import {UiProvider, type UiProviderProps} from './UiProvider';

export type EnsureUiProviderProps = UiProviderProps;

export const EnsureUiProvider: React.FC<EnsureUiProviderProps> = (props) => {
  const existing = React.useContext(context);
  if (existing) return <>{props.children}</>;
  return <UiProvider {...props} />;
};
