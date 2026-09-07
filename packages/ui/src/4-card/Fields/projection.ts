import {FIELD_VARIANTS, type FieldVariant, type FieldEditMode} from './variants';
import type {ViewProjection, View, Stance} from '../../types/ViewProjection';

/** Map the projection's `view` (size/altitude) to a field-list density variant. */
const viewToVariant = (view?: View): FieldVariant => {
  switch (view) {
    case 'card':
      return 'card';
    case 'block':
    case 'page':
    case 'window':
    case 'full':
      return 'block';
    default:
      // inline / chip / icon / badge / list / undefined → the compact menu look.
      return 'menu';
  }
};

/** Map the projection's `stance` to a value-cell edit mode. */
const stanceToEdit = (stance: Stance | undefined, variant: FieldVariant): FieldEditMode | undefined => {
  switch (stance) {
    case 'view':
    case 'comment':
    case 'suggest':
    case 'review':
      return 'view';
    case 'edit':
    case 'create':
      // Immediate inputs in a menu; click-to-reveal in panels.
      return variant === 'menu' ? 'live' : 'reveal';
    default:
      return undefined;
  }
};

export interface ResolvedFieldProjection {
  variant: FieldVariant;
  edit: FieldEditMode;
  spacing: number;
  detail: number;
  align: 'left' | 'right';
}

export interface FieldProjectionOverrides {
  variant?: FieldVariant;
  edit?: FieldEditMode;
  spacing?: number;
  detail?: number;
  align?: 'left' | 'right';
}

/**
 * Resolve a {@link ViewProjection} (+ explicit overrides) into the concrete
 * field-rendering knobs. Precedence: **explicit override > projection field >
 * variant preset**. This is the single mapping that lets one config vocabulary
 * drive the context-menu, card, and block surfaces.
 */
export const resolveProjection = (
  projection?: ViewProjection,
  overrides: FieldProjectionOverrides = {},
): ResolvedFieldProjection => {
  const variant = overrides.variant ?? viewToVariant(projection?.view);
  const preset = FIELD_VARIANTS[variant];
  return {
    variant,
    edit: overrides.edit ?? stanceToEdit(projection?.stance, variant) ?? preset.edit,
    spacing: overrides.spacing ?? projection?.spacing ?? preset.spacing,
    detail: overrides.detail ?? projection?.detail ?? preset.detail,
    align: overrides.align ?? preset.align,
  };
};
