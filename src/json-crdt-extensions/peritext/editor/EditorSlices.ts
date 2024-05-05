import type {Peritext} from '../Peritext';
import type {SliceType} from '../slice/types';
import type {MarkerSlice} from '../slice/MarkerSlice';
import type {Slices} from '../slice/Slices';

export class EditorSlices<T = string> {
  constructor(protected readonly txt: Peritext<T>, protected readonly slices: Slices<T>) {}

  public insMarker(type: SliceType, data?: unknown, separator?: string): MarkerSlice<T>[] {
    const {txt, slices} = this;
    const markers: MarkerSlice<T>[] = [];
    txt.editor.cursors(cursor => {
      cursor.collapse();
      const after = cursor.start.clone();
      after.refAfter();
      const marker = slices.insMarkerAfter(after.id, type, data, separator);
      markers.push(marker);
    });
    return markers;
  }
}
