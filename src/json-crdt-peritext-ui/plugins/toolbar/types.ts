import type * as React from 'react';
import type {MenuItem} from 'nice-ui/lib/4-card/StructuralMenu/types';
import type {SliceBehavior} from '../../../json-crdt-extensions/peritext/registry/SliceBehavior';
import type {SliceStacking} from '../../../json-crdt-extensions/peritext/slice/constants';
import type {TypeTag} from '../../../json-crdt-extensions';
import type {NodeBuilder} from '../../../json-crdt-patch';
import type {NewFormatting, SavedFormatting, ToolbarFormatting} from './state/formattings';

export type {MenuItem};

export interface ToolbarSliceBehaviorData extends Record<string, unknown> {
  menu?: MenuItem;

  /**
   * @param formatting The formatting slice.
   * @returns Validation result. If the formatting is valid, return 'good'
   *     or 'fine'. If the formatting is invalid, return an array of validation
   *     errors.
   */
  validate?: (formatting: ToolbarFormatting) => ValidationResult;

  /**
   * Returns a short description of the formatting, for the user to easily
   * differentiate it from other formattings.
   *
   * @param formatting The formatting slice.
   * @returns A short description of the formatting. For example, if the
   * formatting is text color, this would be the color name.
   */
  previewText?: (formatting: ToolbarFormatting) => string;

  /**
   * A function that returns a React node to be used as an icon for the
   * formatting.
   */
  renderIcon?: (props: IconProps) => React.ReactNode;

  /**
   * Render a small card-sized form which configures the initial state of the
   * formatting, for it to be created.
   */
  New?: React.FC<NewProps>;

  /**
   * Render a small card-sized view, which can be placed in a popup, to
   * preview the formatting.
   */
  View?: React.FC<ViewProps>;

  /**
   * Render a small card-sized form to edit the formatting.
   */
  Edit?: React.FC<EditProps>;
}

// export type ToolbarSliceBehaviorDataTuple = [
//   menu?: ToolbarSliceBehaviorData['menu'],
//   validate?: ToolbarSliceBehaviorData['validate'],
//   previewText?: ToolbarSliceBehaviorData['previewText'],
//   Icon?: ToolbarSliceBehaviorData['Icon'],
//   New?: ToolbarSliceBehaviorData['New'],
//   View?: ToolbarSliceBehaviorData['View'],
//   Edit?: ToolbarSliceBehaviorData['Edit'],
// ];

export interface IconProps {
  formatting: ToolbarFormatting;
}

export interface NewProps {
  formatting: NewFormatting;
}

export interface ViewProps {
  formatting: SavedFormatting;
}

export interface EditProps {
  formatting: SavedFormatting;
}

/**
 * Represents the result of a validation. The `good` and `fine` values
 * represent a successful validation, while the `ValidationErrorResult[]` is
 * a list of errors that occurred during validation.
 */
export type ValidationResult = 'good' | 'fine' | ValidationErrorResult[];

export interface ValidationErrorResult {
  message: string;
  field?: string;
}

export type ToolbarSliceBehavior<
  Stacking extends SliceStacking = SliceStacking,
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> = SliceBehavior<Stacking, Tag, Schema, ToolbarSliceBehaviorData>;
