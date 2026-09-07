import type {BinSchema} from '@jsonjoy.com/json-type';
import * as React from 'react';
import {ChildRow} from '../ChildRow';
import {useType} from '../context';
import {TypeLayout} from '../TypeLayout';

export interface TypeBinProps {
  schema: BinSchema;
  pointer: string;
}

export const TypeBin: React.FC<TypeBinProps> = ({schema, pointer}) => {
  const {render} = useType();
  return (
    <TypeLayout schema={schema} childrenLabel="encoded type">
      <ChildRow pointer={`${pointer}/type`}>{render(schema.type, `${pointer}/type`)}</ChildRow>
    </TypeLayout>
  );
};
