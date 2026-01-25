import * as React from 'react';
import {escapeComponent} from '@jsonjoy.com/json-pointer';
import {context} from './context';
import {ObjectInsert} from '../inserts/ObjectInsert';

export interface JsonObjectInsertProps {
  pointer: string;
  visible?: boolean;
}

export const JsonObjectInsert: React.FC<JsonObjectInsertProps> = ({pointer, visible}) => {
  const {onChange} = React.useContext(context);

  if (!onChange) return null;

  const onSubmit = (property: string, value: string) => {
    let newValue;
    try {
      newValue = JSON.parse(value);
    } catch {
      newValue = String(value);
    }
    onChange([{op: 'add', path: pointer + '/' + escapeComponent(property), value: newValue}]);
  };

  return <ObjectInsert visible={visible} onSubmit={onSubmit} />;
};
