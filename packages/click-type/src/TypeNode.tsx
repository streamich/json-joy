import type {
  ArrSchema,
  BinSchema,
  FnRxSchema,
  FnSchema,
  KeySchema,
  MapSchema,
  ModuleSchema,
  ObjSchema,
  OrSchema,
  SchemaBase,
} from '@jsonjoy.com/json-type';
import * as React from 'react';
import {bareContext, pointerContext, useType} from './context';
import {useIsolation} from './isolation';
import {TypeArr} from './kinds/TypeArr';
import {TypeBin} from './kinds/TypeBin';
import {TypeFn} from './kinds/TypeFn';
import {TypeKey} from './kinds/TypeKey';
import {TypeMap} from './kinds/TypeMap';
import {TypeModule} from './kinds/TypeModule';
import {TypeObj} from './kinds/TypeObj';
import {TypeOr} from './kinds/TypeOr';
import {SchemaToolbar} from './Toolbar';
import {TypeHoverable} from './TypeHoverable';
import {TypeLayout} from './TypeLayout';

const dispatch = (schema: SchemaBase, pointer: string): React.ReactNode => {
  switch (schema.kind) {
    case 'obj':
      return <TypeObj schema={schema as ObjSchema} pointer={pointer} />;
    case 'arr':
      return <TypeArr schema={schema as ArrSchema} pointer={pointer} />;
    case 'map':
      return <TypeMap schema={schema as MapSchema} pointer={pointer} />;
    case 'or':
      return <TypeOr schema={schema as OrSchema} pointer={pointer} />;
    case 'bin':
      return <TypeBin schema={schema as BinSchema} pointer={pointer} />;
    case 'fn':
    case 'fn$':
      return <TypeFn schema={schema as FnSchema | FnRxSchema} pointer={pointer} />;
    case 'module':
      return <TypeModule schema={schema as ModuleSchema} pointer={pointer} />;
    case 'key':
      return <TypeKey schema={schema as KeySchema} pointer={pointer} />;
    default:
      return <TypeLayout schema={schema} />;
  }
};

export interface TypeNodeProps {
  schema: SchemaBase;
  /** JSON Pointer of this node relative to the root (without the `pfx`). */
  pointer: string;
}

/** The body of a node (kind dispatch) without its own hoverable wrapper. */
export const TypeBody: React.FC<TypeNodeProps> = ({schema, pointer}) => (
  <pointerContext.Provider value={pointer}>{dispatch(schema, pointer)}</pointerContext.Provider>
);

/**
 * A schema node: its {@link TypeBody} wrapped in a {@link TypeHoverable} — unless
 * {@link bareContext} is set (a labeled row already provides the hoverable), in
 * which case the body renders bare. Either way the bare flag is reset for the
 * node's descendants.
 */
export const TypeNode: React.FC<TypeNodeProps> = ({schema, pointer}) => {
  const bare = React.useContext(bareContext);
  const {expansion} = useType();
  const {isolate} = useIsolation();
  const body = (
    <bareContext.Provider value={false}>
      <TypeBody schema={schema} pointer={pointer} />
    </bareContext.Provider>
  );
  if (bare) return body;
  const name = (schema as {title?: string}).title ?? schema.kind;
  const toolbar = (
    <SchemaToolbar
      data={schema}
      name={name}
      pointer={pointer}
      convert
      onExpandAll={() => expansion.emit(pointer, true)}
      onCollapseAll={() => expansion.emit(pointer, false)}
      onIsolate={() => isolate(pointer)}
    />
  );
  return (
    <TypeHoverable pointer={pointer} toolbar={toolbar}>
      {body}
    </TypeHoverable>
  );
};
