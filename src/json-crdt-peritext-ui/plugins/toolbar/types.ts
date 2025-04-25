import type * as React from 'react';
import type {MenuItem} from 'nice-ui/lib/4-card/StructuralMenu/types';
import type {SliceRegistryEntry} from '../../../json-crdt-extensions/peritext/registry/SliceRegistryEntry';
import type {SliceStacking} from '../../../json-crdt-extensions/peritext/slice/constants';
import type {Slice, TypeTag} from '../../../json-crdt-extensions';
import type {NodeBuilder} from '../../../json-crdt-patch';

export type {MenuItem};

export interface SliceRegistryEntryData extends Record<string, unknown> {
  menu?: MenuItem;

  /**
   * A function that returns a React node to be used as an icon for the
   * formatting.
   *
   * @param formatting The formatting slice.
   * @returns A React node to be used as an icon for the formatting.
   */
  renderIcon?: (formatting: Formatting) => React.ReactNode;

  /**
   * Returns a short description of the formatting, for the user to easily
   * differentiate it from other formattings.
   *
   * @param formatting The formatting slice.
   * @returns A short description of the formatting. For example, if the
   * formatting is text color, this would be the color name.
   */
  previewText?: (formatting: Formatting) => string;
}

export type ToolBarSliceRegistryEntry<
  Stacking extends SliceStacking = SliceStacking,
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> = SliceRegistryEntry<Stacking, Tag, Schema, SliceRegistryEntryData>;

/**
 * Formatting is a specific application of known formatting option to a range of
 * text. Formatting is composed of a specific {@link Slice} which stores the
 * state (location, data) of the formatting and a {@link ToolBarSliceRegistryEntry}
 * which defines the formatting type and its behavior.
 */
export interface Formatting {
  slice: Slice<string>;
  def: ToolBarSliceRegistryEntry;
}
