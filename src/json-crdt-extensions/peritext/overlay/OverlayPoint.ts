import {Point} from '../rga/Point';
import {compare} from '../../../json-crdt-patch/clock';
import {OverlayRef, OverlayRefSliceEnd, OverlayRefSliceStart} from './refs';
import {printTree} from 'sonic-forest/lib/print/printTree';
import type {HeadlessNode} from 'sonic-forest/lib/types';
import type {Printable} from '../../../util/print/types';
import type {Slice} from '../slice/types';

export class OverlayPoint extends Point implements Printable, HeadlessNode {
  /**
   * Sorted list of references to rich-text constructs.
   */
  public readonly refs: OverlayRef[] = [];

  /**
   * Sorted list of layers, contain the interval from this point to the next one.
   */
  public readonly layers: Slice[] = [];

  /**
   * Collapsed slices.
   * 
   * @todo Rename to `markers`?
   */
  public readonly points: Slice[] = [];

  /** Hash of text contents until the next {@link OverlayPoint}. */
  public hash: number = 0;

  public removeSlice(slice: Slice): void {
    const refs = this.refs;
    const length = refs.length;
    for (let i = 0; i < length; i++) {
      const ref = refs[i];
      if (
        ref === slice ||
        (ref instanceof OverlayRefSliceStart && ref.slice === slice) ||
        (ref instanceof OverlayRefSliceEnd && ref.slice === slice)
      ) {
        refs.splice(i, 1);
        break;
      }
    }
    this.removeLayer(slice);
    this.removePoint(slice);
  }

  /**
   * Inserts a slice to the list of layers which contains the area from this
   * point to the next one.
   * @param slice Slice to add to the layer list.
   */
  public addLayer(slice: Slice): void {
    const layers = this.layers;
    const length = layers.length;
    if (!length) {
      layers.push(slice);
      return;
    }
    // We attempt to insert from the end of the list, as it is the most likely.
    const lastSlice = layers[length - 1];
    const sliceId = slice.id;
    if (compare(lastSlice.id, sliceId) < 0) {
      layers.push(slice);
      return;
    }
    for (let i = length - 2; i >= 0; i--) {
      const currSlice = layers[i];
      if (compare(currSlice.id, sliceId) < 0) {
        layers.splice(i + 1, 0, slice);
        return;
      }
    }
    layers.unshift(slice);
  }

  public removeLayer(slice: Slice): void {
    const layers = this.layers;
    const length = layers.length;
    for (let i = 0; i < length; i++) {
      if (layers[i] === slice) {
        layers.splice(i, 1);
        return;
      }
    }
  }

  public addPoint(slice: Slice): void {
    const points = this.points;
    const length = points.length;
    if (!length) {
      points.push(slice);
      return;
    }
    // We attempt to insert from the end of the list, as it is the most likely.
    const lastSlice = points[length - 1];
    const sliceId = slice.id;
    if (compare(lastSlice.id, sliceId) < 0) {
      points.push(slice);
      return;
    }
    for (let i = length - 2; i >= 0; i--) {
      const currSlice = points[i];
      if (compare(currSlice.id, sliceId) < 0) {
        points.splice(i + 1, 0, slice);
        return;
      }
    }
    points.unshift(slice);
  }

  public removePoint(slice: Slice): void {
    const points = this.points;
    const length = points.length;
    for (let i = 0; i < length; i++) {
      if (points[i] === slice) {
        points.splice(i, 1);
        return;
      }
    }
  }

  // ---------------------------------------------------------------- Printable

  public toStringName(tab: string, lite?: boolean): string {
    return super.toString(tab, lite);
  }

  public toString(tab: string = '', lite?: boolean): string {
    const refs = lite ? '' : `, refs = ${this.refs.length}`;
    const header = this.toStringName(tab, lite) + refs;
    if (lite) return header;
    return (
      header +
      printTree(
        tab,
        this.layers.map((slice) => (tab) => slice.toString(tab)),
      )
    );
  }

  // ------------------------------------------------------------- HeadlessNode

  public p: OverlayPoint | undefined = undefined;
  public l: OverlayPoint | undefined = undefined;
  public r: OverlayPoint | undefined = undefined;
}
