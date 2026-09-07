import type {KeySchema, ObjSchema} from '@jsonjoy.com/json-type';
import * as React from 'react';
import {KeyRow} from '../KeyRow';
import {TypeLayout} from '../TypeLayout';

export interface TypeObjProps {
  schema: ObjSchema;
  pointer: string;
}

export const TypeObj: React.FC<TypeObjProps> = ({schema, pointer}) => {
  const keys = (schema.keys ?? []) as KeySchema[];
  const children =
    keys.length > 0 ? keys.map((key, i) => <KeyRow key={i} schema={key} pointer={`${pointer}/keys/${i}`} />) : null;
  return (
    <TypeLayout schema={schema} childrenLabel="keys">
      {children}
    </TypeLayout>
  );
};
