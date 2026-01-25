import * as React from 'react';
import {Action, ActionProps} from '.';

export const SubmitAction: React.FC<Omit<ActionProps, 'children'>> = (props) => {
  return <Action {...props}>{'→'}</Action>;
};
