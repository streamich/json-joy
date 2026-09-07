import type {AliasSchema, ModuleSchema} from '@jsonjoy.com/json-type';
import * as React from 'react';
import {optional} from '../css';
import {KeyRow} from '../KeyRow';
import {TypeLayout} from '../TypeLayout';

export interface TypeModuleProps {
  schema: ModuleSchema;
  pointer: string;
}

/** A module — a named collection of type aliases, rendered like object keys. */
export const TypeModule: React.FC<TypeModuleProps> = ({schema, pointer}) => {
  const aliases = (schema.keys ?? []) as AliasSchema[];
  const children =
    aliases.length > 0
      ? aliases.map((alias, i) => (
          <KeyRow
            key={i}
            schema={alias}
            pointer={`${pointer}/keys/${i}`}
            suffix={alias.pub === false ? <span className={optional}> (private)</span> : null}
          />
        ))
      : null;
  return (
    <TypeLayout schema={schema} childrenLabel="types">
      {children}
    </TypeLayout>
  );
};
