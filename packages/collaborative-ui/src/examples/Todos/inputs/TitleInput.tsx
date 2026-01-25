import * as React from 'react';
import {CollaborativeFlexibleInput, type CollaborativeFlexibleInputProps} from '../../../CollaborativeFlexibleInput';

export interface TitleInputProps extends CollaborativeFlexibleInputProps {}

export const TitleInput: React.FC<TitleInputProps> = (props) => {
  return <CollaborativeFlexibleInput fullWidth multiline {...props} />;
};
