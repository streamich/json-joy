import type {PatchBuilder} from '../PatchBuilder';
import type {ITimestampStruct} from '../clock';

export type NodeBuilderCallback = (builder: PatchBuilder) => ITimestampStruct;

/**
 * @category Patch
 */
export class NodeBuilder {
  constructor(public readonly build: NodeBuilderCallback) {}
}

export const delayed = (build: NodeBuilderCallback) => new NodeBuilder(build);
