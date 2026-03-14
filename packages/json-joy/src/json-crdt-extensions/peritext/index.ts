import {ExtensionId} from '../constants';
import {PeritextNode} from './PeritextNode';
import {PeritextApi} from './PeritextApi';
import {Peritext} from './Peritext';
import {SCHEMA, MNEMONIC} from './constants';
import {Extension} from '../../json-crdt/extensions/Extension';
import type {PeritextDataNode} from './types';

export {PeritextNode, PeritextApi, Peritext};

export * from './slice';

export type * from './block/types';
export * from './block';

export * from './registry/SliceBehavior';
export * from './registry/SliceRegistry';

export * from './slice/constants';

export type * from './events/types';
export * from './events/PeritextEventTarget';
export * from './events/defaults/PeritextEventDefaults';

export * from './PeritextHeadless';

export const peritext = new Extension<
  ExtensionId.peritext,
  PeritextDataNode,
  PeritextNode,
  PeritextApi,
  [text: string]
>(ExtensionId.peritext, MNEMONIC, PeritextNode, PeritextApi, (text: string) => SCHEMA(text));
