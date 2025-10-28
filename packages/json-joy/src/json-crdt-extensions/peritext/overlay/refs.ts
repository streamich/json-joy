import type {Slice} from '../slice/Slice';

/**
 * On overlay "ref" is a reference from the {@link Overlay} to a {@link Slice}.
 * In case of a *marker* slice, the reference is to the slice itself. In case of
 * a regular annotation slice, two references are needed: one to the start slice
 * and one to the end slice.
 */
export type OverlayRef<T = string> =
  | Slice<T> // Ref to a *marker*
  | OverlayRefSliceStart<T> // Ref to the start of an annotation slice
  | OverlayRefSliceEnd<T>; // Ref to the end of an annotation slice

export class OverlayRefSliceStart<T = string> {
  constructor(public readonly slice: Slice<T>) {}
}

export class OverlayRefSliceEnd<T = string> {
  constructor(public readonly slice: Slice<T>) {}
}
