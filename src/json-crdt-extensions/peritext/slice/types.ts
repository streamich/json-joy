import type {Range} from './Range';
import type {SliceType, Stateful} from '../types';
import type {ITimestampStruct} from '../../../json-crdt-patch/clock';
import type {SliceBehavior} from '../constants';

export interface Slice extends Range, Stateful {
  /** ID used for layer sorting. */
  id: ITimestampStruct;
  behavior: SliceBehavior;
  type: SliceType;
  data(): unknown;
  del(): boolean;
}
