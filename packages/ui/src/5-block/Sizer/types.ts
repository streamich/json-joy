import type {CSSProperties, ReactNode} from 'react';
import type * as rsync from '../../utils/rsync';
import type {SizerState} from './state';

export interface SizerProps {
  /**
   * Bring-your-own state. If omitted, the {@link Sizer} constructs one
   * internally and (optionally) hands it back via {@link onState}.
   */
  state?: SizerState;

  /** Called once with the {@link SizerState} instance. */
  onState?: (state: SizerState) => void;

  /**
   * Controlled atom holding the desired content width in pixels. The
   * component reads from it on every render and writes the new value
   * to it on each drag tick.
   */
  width: rsync.ReactValue<number>;

  /** Minimum content width in pixels. Default: `200`. */
  minWidth?: number;

  /** Whether the dividers can be dragged. Default: `true`. */
  resizable?: boolean;

  /**
   * Distance in pixels from the content edge to the handle's vertical line.
   * The hit area still extends across this margin so the handle stays
   * grabbable. Default: `0`.
   */
  handleMargin?: number;

  /** Resting handle width in pixels. Default: `1`. */
  handleWidth?: number;

  /** Top/bottom padding of the handle in pixels. Default: `0`. */
  handlePadding?: number;

  /** Maximum handle height in pixels. Default: unlimited. */
  handleMaxHeight?: number;

  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export interface SizerDividerProps {
  state: SizerState;
  width: rsync.ReactValue<number>;
  side: 'left' | 'right';
  minWidth: number;
  disabled?: boolean;
  /** Distance in px between content edge and handle center. */
  handleMargin?: number;
  /** Resting handle width in px. */
  handleWidth?: number;
  /** Top/bottom padding inside the handle in px. */
  handlePadding?: number;
  /** Maximum handle height in px. */
  handleMaxHeight?: number;
}
