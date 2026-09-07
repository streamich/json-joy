import type {KeySchema} from '@jsonjoy.com/json-type';
import * as React from 'react';
import {ChildRow} from '../ChildRow';
import {useType} from '../context';
import {keyName, optional} from '../css';
import {TypeLayout} from '../TypeLayout';

export interface TypeKeyProps {
  schema: KeySchema;
  pointer: string;
}

/**
 * A standalone object field. Normally fields are rendered inline by
 * {@link KeyRow}; this handles a `key` schema passed directly as a root.
 */
export const TypeKey: React.FC<TypeKeyProps> = ({schema, pointer}) => {
  const {render} = useType();
  return (
    <TypeLayout schema={schema} childrenLabel="field">
      <ChildRow
        label={
          <>
            <span className={keyName}>{schema.key}</span>
            {schema.optional ? <span className={optional}>?</span> : null}
          </>
        }
        pointer={`${pointer}/value`}
      >
        {render(schema.value, `${pointer}/value`)}
      </ChildRow>
    </TypeLayout>
  );
};
