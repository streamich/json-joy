import type {MenuItem} from 'nice-ui/lib/4-card/StructuralMenu/types';
import type {SliceRegistryEntry} from '../../../json-crdt-extensions/peritext/registry/SliceRegistryEntry';
import type {SliceBehavior} from '../../../json-crdt-extensions/peritext/slice/constants';
import type {TypeTag} from '../../../json-crdt-extensions';
import type {NodeBuilder} from '../../../json-crdt-patch';

export type {MenuItem};

export interface SliceRegistryEntryData extends Record<string, unknown> {
  menu?: MenuItem;
}

export type ToolBarSliceRegistryEntry<
  Behavior extends SliceBehavior = SliceBehavior,
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> = SliceRegistryEntry<Behavior, Tag, Schema, SliceRegistryEntryData>;
