import {ExtensionId} from '../constants';
import {ProseMirrorNode} from './ProseMirrorNode';
import {ProseMirrorApi} from './ProseMirrorApi';
import {MNEMONIC} from './constants';
import {Extension} from '../../json-crdt/extensions/Extension';
import {SCHEMA} from '../peritext/constants';
import type {PmDataNode} from './types';

export {ProseMirrorNode, ProseMirrorApi};

export const prosemirror = new Extension<
  ExtensionId.prosemirror,
  PmDataNode,
  ProseMirrorNode,
  ProseMirrorApi,
  [text?: string]
>(ExtensionId.prosemirror, MNEMONIC, ProseMirrorNode, ProseMirrorApi, (text: string = '') => SCHEMA(text));
