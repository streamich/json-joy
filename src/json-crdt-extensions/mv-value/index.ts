import {delayed} from '../../json-crdt-patch/builder/DelayedValueBuilder';
import {ext} from '../../json-crdt/extensions';
import {ExtensionId} from '../constants';
import {ValueMv} from './ValueMv';
import {ValueMvApi} from './ValueMvApi';
import type {ITimestampStruct} from '../../json-crdt-patch/clock';
import type {ArrNode} from '../../json-crdt/nodes/arr/ArrNode';
import type {ExtensionDefinition} from '../../json-crdt';

export const ValueMvExt: ExtensionDefinition<ArrNode, ValueMv, ValueMvApi> = {
  id: ExtensionId.MvValue,
  new: (value: unknown | ITimestampStruct) =>
    ext(
      ExtensionId.MvValue,
      delayed((builder) => builder.jsonArr([value])),
    ),
  Node: ValueMv,
  Api: ValueMvApi,
};
