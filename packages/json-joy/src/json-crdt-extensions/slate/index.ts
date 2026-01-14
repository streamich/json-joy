import {ExtensionId} from '../constants';
import {SlateNode} from './SlateNode';
import {SlateApi} from './SlateApi';
import {MNEMONIC} from './constants';
import {Extension} from '../../json-crdt/extensions/Extension';
import {SCHEMA} from '../peritext/constants';
import type {SlateDataNode} from './types';

export {SlateNode, SlateApi};

export const slate = new Extension<
  ExtensionId.slate,
  SlateDataNode,
  SlateNode,
  SlateApi,
  [text?: string]
>(ExtensionId.slate, MNEMONIC, SlateNode, SlateApi, (text: string = '') => SCHEMA(text));
