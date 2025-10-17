import {Point} from '../rga/Point';
import {compare} from '../../../json-crdt-patch/clock';
import {type OverlayRef, OverlayRefSliceEnd, OverlayRefSliceStart} from './refs';
import {printTree} from 'tree-dump/lib/printTree';
import type {MarkerSlice} from '../slice/MarkerSlice';
import type {HeadlessNode} from 'sonic-forest/lib/types';
import type {PrintChild, Printable} from 'tree-dump/lib/types';
import type {Slice} from '../slice/types';

/**
 * A {@link Point} which is indexed in the {@link Overlay} tree. Represents
 * sparse locations in the string of the places where annotation slices start,
 * end, or are broken down by other intersecting slices.
 */
export class OverlayPoint<T = string> extends Point<T> implements Printable, HeadlessNode {
  /**
   * Hash of text contents until the next {@link OverlayPoint}. This field is
   * modified by the {@link Overlay} tree.
   */
  public hash: number = 0;

  // ------------------------------------------------------------------- layers

  /**
   * Sorted list of layers, contains the interval from this point to the next
   * one. A *layer* is a part of a slice from the current point to the next one.
   * This interval can contain many layers, as the slices can be overlapped.
   */
  public readonly layers: Slice<T>[] = [];

  /**
   * Inserts a slice to the list of layers which contains the area from this
   * point until the next one. The operation is idempotent, so inserting the
   * same slice twice will not change the state of the point. The layers are
   * sorted by the slice ID.
   *
   * @param slice Slice to add to the layer list.
   */
  public addLayer(slice: Slice<T>): void {
    const layers = this.layers;
    const length = layers.length;
    if (!length) {
      layers.push(slice);
      return;
    }
    // We attempt to insert from the end of the list, as it is the most likely
    // scenario. And `.push()` is more efficient than `.unshift()`.
    const lastSlice = layers[length - 1];
    const sliceId = slice.id;
    const cmp = compare(lastSlice.id, sliceId);
    if (cmp < 0) {
      layers.push(slice);
      return;
    } else if (!cmp) return;
    for (let i = length - 2; i >= 0; i--) {
      const currSlice = layers[i];
      const cmp = compare(currSlice.id, sliceId);
      if (cmp < 0) {
        layers.splice(i + 1, 0, slice);
        return;
      } else if (!cmp) return;
    }
    layers.unshift(slice);
  }

  /**
   * Removes a slice from the list of layers, which start from this overlay
   * point.
   *
   * @param slice Slice to remove from the layer list.
   */
  public removeLayer(slice: Slice<T>): void {
    const layers = this.layers;
    const length = layers.length;
    for (let i = 0; i < length; i++) {
      if (layers[i] === slice) {
        layers.splice(i, 1);
        return;
      }
    }
  }

  // ------------------------------------------------------------------ markers

  /**
   * Collapsed slices - markers (block splits), which represent a single point
   * in the text, even if the start and end of the slice are different.
   */
  public readonly markers: Slice<T>[] = [];

  /**
   * Inserts a slice to the list of markers which represent a single point in
   * the text, even if the start and end of the slice are different. The
   * operation is idempotent, so inserting the same slice twice will not change
   * the state of the point. The markers are sorted by the slice ID.
   *
   * @param slice Slice to add to the marker list.
   */
  public addMarker(slice: Slice<T>): void {
    const markers = this.markers;
    const length = markers.length;
    if (!length) {
      markers.push(slice);
      return;
    }
    // We attempt to insert from the end of the list, as it is the most likely
    // scenario. And `.push()` is more efficient than `.unshift()`.
    const lastSlice = markers[length - 1];
    const sliceId = slice.id;
    const cmp = compare(lastSlice.id, sliceId);
    if (cmp < 0) {
      markers.push(slice);
      return;
    } else if (!cmp) return;
    for (let i = length - 2; i >= 0; i--) {
      const currSlice = markers[i];
      const cmp = compare(currSlice.id, sliceId);
      if (cmp < 0) {
        markers.splice(i + 1, 0, slice);
        return;
      } else if (!cmp) return;
    }
    markers.unshift(slice);
  }

  /**
   * Removes a slice from the list of markers, which represent a single point in
   * the text, even if the start and end of the slice are different.
   *
   * @param slice Slice to remove from the marker list.
   */
  public removeMarker(slice: Slice<T>): void {
    const markers = this.markers;
    const length = markers.length;
    for (let i = 0; i < length; i++) {
      if (markers[i] === slice) {
        markers.splice(i, 1);
        return;
      }
    }
  }

  // --------------------------------------------------------------------- refs

  /**
   * Sorted list of all references to rich-text constructs.
   */
  public readonly refs: OverlayRef<T>[] = [];

  /**
   * Insert a reference to a marker.
   *
   * @param slice A marker (split slice).
   */
  public addMarkerRef(slice: MarkerSlice<T>): void {
    this.refs.push(slice);
    this.addMarker(slice);
  }

  /**
   * Insert a layer that starts at this point.
   *
   * @param slice A slice that starts at this point.
   */
  public addLayerStartRef(slice: Slice<T>): void {
    this.refs.push(new OverlayRefSliceStart<T>(slice));
    this.addLayer(slice);
  }

  /**
   * Insert a layer that ends at this point.
   *
   * @param slice A slice that ends at this point.
   */
  public addLayerEndRef(slice: Slice<T>): void {
    this.refs.push(new OverlayRefSliceEnd(slice));
  }

  /**
   * Removes a reference to a marker or a slice, and remove the corresponding
   * layer or marker.
   *
   * @param slice A slice to remove the reference to.
   */
  public removeRef(slice: Slice<T>): void {
    const refs = this.refs;
    const length = refs.length;
    for (let i = 0; i < length; i++) {
      const ref = refs[i];
      if (ref === slice) {
        refs.splice(i, 1);
        this.removeMarker(slice);
        return;
      }
      if (
        (ref instanceof OverlayRefSliceStart && ref.slice === slice) ||
        (ref instanceof OverlayRefSliceEnd && ref.slice === slice)
      ) {
        refs.splice(i, 1);
        this.removeLayer(slice);
        return;
      }
    }
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(): string {
    return 'OverlayPoint';
  }

  public toStringHeader(tab: string = '', lite?: boolean): string {
    return super.toString(tab, lite);
  }

  public toString(tab: string = '', lite?: boolean): string {
    const refs = lite ? '' : `, refs = ${this.refs.length}`;
    const header = this.toStringHeader(tab, lite) + refs;
    if (lite) return header;
    const children: PrintChild[] = [];
    const layers = this.layers;
    const layerLength = layers.length;
    for (let i = 0; i < layerLength; i++) children.push((tab) => layers[i].toString(tab));
    const markers = this.markers;
    const markerLength = markers.length;
    for (let i = 0; i < markerLength; i++) children.push((tab) => markers[i].toString(tab));
    return header + printTree(tab, children);
  }

  // ------------------------------------------------------------- HeadlessNode

  public p: OverlayPoint<T> | undefined = undefined;
  public l: OverlayPoint<T> | undefined = undefined;
  public r: OverlayPoint<T> | undefined = undefined;
}
