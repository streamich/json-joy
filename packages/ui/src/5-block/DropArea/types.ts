import type * as React from 'react';
import type {CSSProperties, ReactNode} from 'react';
import type {DropAreaState} from './state';

export interface DropAreaProps {
  /**
   * Bring-your-own state. If omitted, the {@link DropArea} constructs one
   * internally and (optionally) hands it back via {@link onState}.
   */
  state?: DropAreaState;

  /** Called once with the {@link DropAreaState} instance. */
  onState?: (state: DropAreaState) => void;

  /** Called when files are dropped on the area or picked via the input. */
  onFiles?: (files: File[]) => void;

  /** Called when a URI is dropped. */
  onUri?: (uri: string) => void;

  /** Called when text is dropped. */
  onText?: (text: string) => void;

  /** Whether the file picker allows multiple selection. Default: `true`. */
  multiple?: boolean;

  /** `accept` attribute forwarded to the file picker input. */
  accept?: string;

  /** Whether clicking the area opens the file picker. Default: `true`. */
  clickToPick?: boolean;

  /**
   * Custom click handler for the drop area. If provided, replaces the
   * default click-to-pick behavior — call {@link DropAreaState.pick} from
   * inside if you still want to open the picker.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  /** Tighter vertical padding. */
  compact?: boolean;

  /** Whether to wrap the area in an outer {@link Paper}. Default: `true`. */
  paper?: boolean;

  /**
   * Content to render inside the drop area. Typically text, optionally
   * accompanied by an icon. If omitted, a default "Click or drop files
   * here" label is shown.
   */
  children?: ReactNode;

  className?: string;
  style?: CSSProperties;
}
