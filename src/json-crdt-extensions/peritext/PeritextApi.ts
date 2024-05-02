import {NodeApi} from '../../json-crdt/model/api/nodes';
import type {PeritextNode} from './PeritextNode';
import type {ExtensionApi} from '../../json-crdt';

export class PeritextApi extends NodeApi<PeritextNode> implements ExtensionApi<PeritextNode> {
}
