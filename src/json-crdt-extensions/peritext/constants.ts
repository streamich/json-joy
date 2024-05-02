import {nodes, s} from '../../json-crdt-patch';
import {ExtensionId, ExtensionName} from '../constants';
import {SliceSchema} from './slice/types';

export const enum Chars {
  BlockSplitSentinel = '\n',
}

export const MNEMONIC = ExtensionName[ExtensionId.peritext];

export const BUILD_SCHEMA = (text: string) =>
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

export const SCHEMA = BUILD_SCHEMA('');
