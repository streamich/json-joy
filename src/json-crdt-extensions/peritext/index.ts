import {ExtensionId} from '../constants';
import {PeritextNode} from './PeritextNode';
import {PeritextApi} from './PeritextApi';
import {SCHEMA, MNEMONIC} from './constants';
import {Extension} from '../../json-crdt/extensions/Extension';
import type {PeritextDataNode} from './types';

export {
  PeritextNode,
  PeritextApi,
};

export const peritext = new Extension<
  ExtensionId.peritext,
  PeritextDataNode,
  PeritextNode,
  PeritextApi,
  [text: string]
>(ExtensionId.peritext, MNEMONIC, PeritextNode, PeritextApi, (text: string) => SCHEMA(text));
