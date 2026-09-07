import type {FnRxSchema, FnSchema} from '@jsonjoy.com/json-type';
import * as React from 'react';
import {ChildRow} from '../ChildRow';
import {useType} from '../context';
import {TypeLayout} from '../TypeLayout';

export interface TypeFnProps {
  /** Handles both `fn` and streaming `fn$`. */
  schema: FnSchema | FnRxSchema;
  pointer: string;
}

export const TypeFn: React.FC<TypeFnProps> = ({schema, pointer}) => {
  const {render} = useType();
  return (
    <TypeLayout schema={schema} childrenLabel="signature">
      <ChildRow label="req" pointer={`${pointer}/req`}>
        {render(schema.req, `${pointer}/req`)}
      </ChildRow>
      <ChildRow label="res" pointer={`${pointer}/res`}>
        {render(schema.res, `${pointer}/res`)}
      </ChildRow>
    </TypeLayout>
  );
};
