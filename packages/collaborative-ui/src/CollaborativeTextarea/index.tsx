import * as React from 'react';
import {CollaborativeInput, type CollaborativeInputProps} from '../CollaborativeInput';

export interface CollaborativeTextareaProps extends Omit<CollaborativeInputProps, 'multiline'> {}

export const CollaborativeTextarea: React.FC<CollaborativeTextareaProps> = (props) => {
  return <CollaborativeInput {...props} multiline />;
};
