import type {MapSchema} from '@jsonjoy.com/json-type';
import * as React from 'react';
import {ChildRow} from '../ChildRow';
import {useType} from '../context';
import {TypeLayout} from '../TypeLayout';

export interface TypeMapProps {
  schema: MapSchema;
  pointer: string;
}

export const TypeMap: React.FC<TypeMapProps> = ({schema, pointer}) => {
  const {render} = useType();
  return (
    <TypeLayout schema={schema} childrenLabel="entries">
      {schema.key ? (
        <ChildRow label="key" pointer={`${pointer}/key`}>
          {render(schema.key, `${pointer}/key`)}
        </ChildRow>
      ) : null}
      <ChildRow label="value" pointer={`${pointer}/value`}>
        {render(schema.value, `${pointer}/value`)}
      </ChildRow>
    </TypeLayout>
  );
};
