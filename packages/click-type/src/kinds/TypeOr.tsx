import type {OrSchema, Schema} from '@jsonjoy.com/json-type';
import {rule} from 'nano-theme';
import * as React from 'react';
import {useType} from '../context';
import {TypeLayout} from '../TypeLayout';

const variant = rule({
  d: 'block',
  lh: '1.7',
  pdl: '4px',
});

export interface TypeOrProps {
  schema: OrSchema;
  pointer: string;
}

export const TypeOr: React.FC<TypeOrProps> = ({schema, pointer}) => {
  const {render} = useType();
  const types = (schema.types ?? []) as Schema[];
  const children =
    types.length > 0
      ? types.map((s, i) => (
          <span key={i} className={variant}>
            {render(s, `${pointer}/types/${i}`)}
          </span>
        ))
      : null;
  return (
    <TypeLayout schema={schema} childrenLabel="variants">
      {children}
    </TypeLayout>
  );
};
