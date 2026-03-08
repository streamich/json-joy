import * as React from 'react';
import {SliceBehavior, type SliceStacking, type TypeTag} from 'json-joy/lib/json-crdt-extensions';
import type {NodeBuilder} from 'json-joy/lib/json-crdt-patch';
import type {MenuItem} from '../types';
import type {EditableFormatting, SavedFormatting, ToolbarFormatting} from '../state/formattings';

export class InlineSliceBehavior<
  Stacking extends SliceStacking = SliceStacking,
  Tag extends TypeTag = TypeTag,
  Schema extends NodeBuilder = NodeBuilder,
> extends SliceBehavior<Stacking, Tag, Schema> {
  /**
   * Defines how this formatting should be displayed in the toolbar and context
   * menus.
   */
  menu?: MenuItem = void 0;

  /**
   * @param formatting The formatting slice.
   * @returns Validation result. If the formatting is valid, return 'good'
   *     or 'fine'. If the formatting is invalid, return an array of validation
   *     errors.
   */
  validate?: (formatting: ToolbarFormatting<any, any>) => ValidationResult = void 0;

  /**
   * Returns a short description of the formatting, for the user to easily
   * differentiate it from other formattings.
   *
   * @param formatting The formatting slice.
   * @returns A short description of the formatting. For example, if the
   * formatting is text color, this would be the color name.
   */
  previewText?: (formatting: ToolbarFormatting) => string = void 0;

  /**
   * A function that returns a React node to be used as an icon for the
   * formatting.
   */
  renderIcon?: (props: IconProps) => React.ReactNode = void 0;

  /**
   * Render a small card-sized view, which can be placed in a popup, to
   * preview the formatting.
   */
  View?: React.FC<ViewProps> = void 0;

  /**
   * Render a small card-sized form which configures the state of the
   * formatting.
   */
  Edit?: React.FC<EditProps> = void 0;
}

export interface IconProps {
  formatting: ToolbarFormatting;
}

export interface ViewProps {
  formatting: SavedFormatting;

  /** Call when user wants to enter "edit" mode for this formatting. */
  onEdit: () => void;
}

export interface EditProps {
  /**
   * The formatting slice to be edited.
   */
  formatting: EditableFormatting;

  /**
   * The function to be called when the formatting is ready to be saved.
   *
   * @todo Rename to `onDone`.
   */
  onSave: () => void;

  /**
   * Set to `true` if the formatting is new and not yet saved.
   */
  isNew?: boolean;
}

/**
 * Represents the result of a validation. The `good` and `fine` values
 * represent a successful validation, while the `ValidationErrorResult[]` is
 * a list of errors that occurred during validation. The `empty` value means
 * that not enough data was provided to validate the formatting.
 */
export type ValidationResult = 'good' | 'fine' | 'empty' | ValidationErrorResult[];
export interface ValidationErrorResult {
  code: string;
  message?: string;
  field?: string;
}
