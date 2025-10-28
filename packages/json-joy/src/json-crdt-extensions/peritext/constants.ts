import {type nodes, s} from '../../json-crdt-patch';
import {ExtensionId, ExtensionName} from '../constants';
import type {SliceSchema} from './slice/types';

export enum Position {
  /**
   * Specifies the absolute start of the text, i.e. the position before the
   * first character. In model space it is defined as string ID and "after"
   * anchor.
   */
  AbsStart = -1,

  /**
   * Specifies the absolute end of the text, i.e. the position after the last
   * character. In model space it is defined as string ID and "before" anchor.
   */
  AbsEnd = 9007199254740991, // Number.MAX_SAFE_INTEGER
}

export const MNEMONIC = ExtensionName[ExtensionId.peritext];

export const SCHEMA = (text: string) =>
  s.vec<
    [
      /**
       * The text of the node. All rich-text textual data is stored in this node.
       */
      str: nodes.str<string>,
      /**
       * The slices of the node. All rich-text annotations are stored in this
       * node.
       */
      slices: nodes.arr<SliceSchema>,
    ]
  >(s.str<string>(text), s.arr<SliceSchema>([]));
