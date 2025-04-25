import type * as React from 'react';
import type {MenuItem} from 'nice-ui/lib/4-card/StructuralMenu/types';
import type {SliceBehavior} from '../../../json-crdt-extensions/peritext/registry/SliceBehavior';
import type {SliceStacking} from '../../../json-crdt-extensions/peritext/slice/constants';
import type {TypeTag} from '../../../json-crdt-extensions';
import type {NodeBuilder} from '../../../json-crdt-patch';
import type {SliceFormatting} from './state/formattings';

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
  renderIcon?: (formatting: SliceFormatting) => React.ReactNode;

  /**
   * Returns a short description of the formatting, for the user to easily
   * differentiate it from other formattings.
   *
   * @param formatting The formatting slice.
   * @returns A short description of the formatting. For example, if the
   * formatting is text color, this would be the color name.
   */
  previewText?: (formatting: SliceFormatting) => string;

  /**
   * Render a small card, which can be rendered in a popup, to preview and
   * configure the formatting.
   *
   * @param formatting The formatting slice.
   * @returns A React node to be used as a preview of the formatting.
   */
  renderCard?: (formatting: SliceFormatting) => React.ReactNode;
}

export type ToolbarSliceBehavior<
  Stacking extends SliceStacking = SliceStacking,
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> = SliceBehavior<Stacking, Tag, Schema, SliceRegistryEntryData>;
