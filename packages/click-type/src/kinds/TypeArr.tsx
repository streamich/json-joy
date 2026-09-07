import type {ArrSchema, Schema} from '@jsonjoy.com/json-type';
import * as React from 'react';
import {ChildRow} from '../ChildRow';
import {useType} from '../context';
import {TypeInline} from '../TypeInline';
import {TypeLayout} from '../TypeLayout';

export interface TypeArrProps {
  schema: ArrSchema;
  pointer: string;
}

export const TypeArr: React.FC<TypeArrProps> = ({schema, pointer}) => {
  const {render} = useType();
  const head = (schema.head ?? []) as Schema[];
  const tail = (schema.tail ?? []) as Schema[];
  const isTuple = head.length > 0 || tail.length > 0;

  if (!isTuple) {
    if (!schema.type) return <TypeLayout schema={schema} />;
    const valuePointer = `${pointer}/type`;
    return (
      <TypeLayout
        schema={schema}
        childrenLabel="elements"
        childrenPreview={<TypeInline schema={schema.type} />}
        trailer={
          <>
            [ <TypeInline schema={schema.type} /> ]
          </>
        }
      >
        <ChildRow pointer={valuePointer}>{render(schema.type, valuePointer)}</ChildRow>
      </TypeLayout>
    );
  }

  const children = (
    <>
      {head.map((s, i) => (
        <ChildRow key={`h${i}`} label={`[${i}]`} pointer={`${pointer}/head/${i}`}>
          {render(s, `${pointer}/head/${i}`)}
        </ChildRow>
      ))}
      {schema.type ? (
        <ChildRow label="…items" pointer={`${pointer}/type`}>
          {render(schema.type, `${pointer}/type`)}
        </ChildRow>
      ) : null}
      {tail.map((s, i) => (
        <ChildRow key={`t${i}`} label={`[-${tail.length - i}]`} pointer={`${pointer}/tail/${i}`}>
          {render(s, `${pointer}/tail/${i}`)}
        </ChildRow>
      ))}
    </>
  );
  return (
    <TypeLayout schema={schema} childrenLabel="elements">
      {children}
    </TypeLayout>
  );
};
