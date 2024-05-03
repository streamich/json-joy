import {ExtensionId} from '../constants';
import {MvalNode} from './MvalNode';
import {MvalApi} from './MvalApi';
import {MNEMONIC} from './constants';
import {s} from '../../json-crdt';
import {Extension} from '../../json-crdt/extensions/Extension';
import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';

export const mval = new Extension<ExtensionId.mval, ArrNode, MvalNode, MvalApi, [value?: unknown | ITimestampStruct]>(
  ExtensionId.mval,
  MNEMONIC,
  MvalNode,
  MvalApi,
  (value: unknown | ITimestampStruct) => s.arr<any>(value === undefined ? [] : [s.json(value)]),
);
