import {ExtensionId} from '../constants';
import {MvalNode} from './MvalNode';
import {MvalApi} from './MvalApi';
import {MNEMONIC} from './constants';
import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import {s, type ExtensionDefinition} from '../../json-crdt';

export const MvalExt: ExtensionDefinition<ArrNode, MvalNode, MvalApi> = {
  id: ExtensionId.mval,
  name: MNEMONIC,
  new: (value: unknown | ITimestampStruct) => s.ext(ExtensionId.mval, s.arr<any>([s.json(value)])),
  Node: MvalNode,
  Api: MvalApi,
};
