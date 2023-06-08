import type {PatchBuilder} from '../PatchBuilder';
import type {ITimestampStruct} from '../clock';

export type DelayedValueBuilderCallback = (api: PatchBuilder) => ITimestampStruct;

export class DelayedValueBuilder {
  constructor(public readonly build: DelayedValueBuilderCallback) {}
}

export const delayed = (build: DelayedValueBuilderCallback) => new DelayedValueBuilder(build);
