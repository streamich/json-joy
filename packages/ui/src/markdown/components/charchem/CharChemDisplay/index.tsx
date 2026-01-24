import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';
import loadCharChem from '../loadCharChem';

const loader = () => Promise.all([import('./CharChemStructuralFormula'), loadCharChem()]);

export interface Props {
  source: string;
}

const CharChemDisplay: React.FC<Props> = ({source}) => {
  const {loading, error, value} =
    useAsync<() => Promise<[{default: React.ComponentType<{source: string}>}, unknown]>>(loader);

  if (loading || error) return null;

  const [{default: CharChemStructuralFormula}] = value as any;

  return <CharChemStructuralFormula source={source} />;
};

export default CharChemDisplay;
