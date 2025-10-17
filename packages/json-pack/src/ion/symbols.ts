import {Import} from './Import';
import type {SymbolTable} from './types';

export const systemSymbolTable: SymbolTable = [
  '$ion',
  '$ion_1_0',
  '$ion_symbol_table',
  'name',
  'version',
  'imports',
  'symbols',
  'max_id',
  '$ion_shared_symbol_table',
];

export const systemSymbolImport = new Import(null, systemSymbolTable);
