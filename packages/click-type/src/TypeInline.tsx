import type {SchemaBase} from '@jsonjoy.com/json-type';
import {rule} from 'nano-theme';
import * as React from 'react';
import {KindLabel} from './KindLabel';
import {getTrailer} from './trailer';

const inline = rule({
  d: 'inline-block',
});

const inlineTrailer = rule({
  fz: '0.9em',
  col: 'var(--ct-muted)',
});

export interface TypeInlineProps {
  schema: SchemaBase;
}

/**
 * A compact, non-interactive one-line preview of a type — its kind chip plus a
 * short trailer (e.g. `str`, `num u8 ≥0 ≤5`, `obj { 3 keys }`). Used to preview
 * an array's element type inline, but generic enough for any inline type slot.
 */
export const TypeInline: React.FC<TypeInlineProps> = ({schema}) => {
  const trailer = getTrailer(schema);
  return (
    <span className={inline}>
      <KindLabel kind={schema.kind} />
      {trailer ? <span className={inlineTrailer}>{trailer}</span> : null}
    </span>
  );
};
