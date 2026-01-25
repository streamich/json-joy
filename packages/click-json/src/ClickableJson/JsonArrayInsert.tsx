import * as React from 'react';
import {context} from './context';
import {ArrayInsert} from '../inserts/ArrayInsert';

export interface JsonArrayInsertProps {
  pointer: string;
  visible?: boolean;
}

export const JsonArrayInsert: React.FC<JsonArrayInsertProps> = ({pointer, visible}) => {
  const {onChange} = React.useContext(context);

  if (!onChange) return null;

  const onSubmit = (value: string) => {
    let newValue;
    try {
      newValue = JSON.parse(value);
    } catch {
      newValue = String(value);
    }
    onChange([{op: 'add', path: pointer, value: newValue}]);
  };

  return <ArrayInsert visible={visible} onSubmit={onSubmit} />;
};
