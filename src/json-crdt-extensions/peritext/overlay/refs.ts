import type {MarkerSlice} from '../slice/MarkerSlice';
import type {Slice} from '../slice/types';

/**
 * On overlay "ref" is a reference from the {@link Overlay} to a {@link Slice}.
 * In case of a *marker* slice, the reference is to the slice itself. In case of
 * a regular annotation slice, two references are needed: one to the start slice
 * and one to the end slice.
 */
export type OverlayRef =
  | MarkerSlice // Ref to a *marker*
  | OverlayRefSliceStart // Ref to the start of an annotation slice
  | OverlayRefSliceEnd; // Ref to the end of an annotation slice

export class OverlayRefSliceStart {
  constructor(public readonly slice: Slice) {}
}

export class OverlayRefSliceEnd {
  constructor(public readonly slice: Slice) {}
}
