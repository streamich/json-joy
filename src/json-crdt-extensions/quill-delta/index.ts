import {ExtensionId} from '../constants';
import {QuillDeltaNode} from './QuillDeltaNode';
import {QuillDeltaApi} from './QuillDeltaApi';
import {MNEMONIC} from './constants';
import {Extension} from '../../json-crdt/extensions/Extension';
import {SCHEMA} from '../peritext/constants';
import type {QuillDataNode} from './types';

export {QuillDeltaNode, QuillDeltaApi};

export const quill = new Extension<ExtensionId.quill, QuillDataNode, QuillDeltaNode, QuillDeltaApi, [text: string]>(
  ExtensionId.quill,
  MNEMONIC,
  QuillDeltaNode,
  QuillDeltaApi,
  (text: string) => SCHEMA(text),
);
