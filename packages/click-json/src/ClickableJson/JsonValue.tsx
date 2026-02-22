import * as React from 'react';
import {JsonProperty} from './JsonProperty';
import {ValueInput} from './ValueInput';
import type {OnChange} from './types';
import {JsonAtom} from '../JsonAtom';

export interface JsonValueProps {
  pointer: string;
  property?: string | number;
  doc: unknown;
  parentCollapsed?: boolean;
  comma?: boolean;
  onChange?: OnChange;
}

export const JsonValue: React.FC<JsonValueProps> = (props) => {
  const {pointer, property, doc, parentCollapsed, comma, onChange} = props;
  const isBinary = doc instanceof Uint8Array;

  const handleChange = (newValue: unknown) => {
    if (onChange) onChange([{op: 'replace', path: pointer, value: newValue}]);
  };

  return (
    <>
      {typeof property === 'string' && (
        <JsonProperty key={'k' + String(parentCollapsed)} pointer={pointer} onChange={onChange} />
      )}
      {!onChange || isBinary ? (
        <JsonAtom value={doc} />
      ) : (
        <ValueInput key={String(parentCollapsed)} value={doc} onChange={handleChange} />
      )}
      {!!comma && ','}
    </>
  );
};
