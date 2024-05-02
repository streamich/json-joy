import {ext} from '../../json-crdt/extensions';
import {ExtensionId} from '../constants';
import {PeritextNode} from './PeritextNode';
import {PeritextApi} from './PeritextApi';
import {BUILD_SCHEMA, MNEMONIC} from './constants';
import type {PeritextDataNode} from './types';
import type {ExtensionDefinition} from '../../json-crdt';

export const PeritextExt: ExtensionDefinition<PeritextDataNode, PeritextNode, PeritextApi> = {
  id: ExtensionId.peritext,
  name: MNEMONIC,
  new: (text: string) => ext(ExtensionId.peritext, BUILD_SCHEMA(text)),
  Node: PeritextNode,
  Api: PeritextApi,
};
