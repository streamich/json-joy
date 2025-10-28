import {Slice} from '../slice/Slice';
import type {Peritext} from '../Peritext';
import type {SliceType} from '../slice/types';
import type {Slices} from '../slice/Slices';
import type {ITimestampStruct} from '../../../json-crdt-patch';
import type {Range} from '../rga/Range';

const forEachRange = <T, S extends Slice<T>>(
  selection: Range<T>[] | IterableIterator<Range<T>>,
  callback: (range: Range<T>) => S,
): S[] => {
  const slices: S[] = [];
  for (const cursor of selection) {
    const slice = callback(cursor);
    slices.push(slice);
  }
  return slices;
};

export class EditorSlices<T = string> {
  constructor(
    protected readonly txt: Peritext<T>,
    public readonly slices: Slices<T>,
  ) {}

  /**
   * @todo Rename to `insMany`.
   */
  public insStack(
    type: SliceType,
    data?: unknown | ITimestampStruct,
    selection?: Range<T>[] | IterableIterator<Range<T>>,
  ): Slice<T>[] {
    const {slices, txt} = this;
    selection ||= txt.editor.cursors();
    return forEachRange(selection, (range) => slices.insStack(range.range(), type, data));
  }

  public insOne(
    type: SliceType,
    data?: unknown | ITimestampStruct,
    selection?: Range<T>[] | IterableIterator<Range<T>>,
  ): Slice<T>[] {
    const {slices, txt} = this;
    selection ||= txt.editor.cursors();
    return forEachRange(selection, (range) => slices.insOne(range.range(), type, data));
  }

  public insErase(
    type: SliceType,
    data?: unknown | ITimestampStruct,
    selection?: Range<T>[] | IterableIterator<Range<T>>,
  ): Slice<T>[] {
    const {slices, txt} = this;
    selection ||= txt.editor.cursors();
    return forEachRange(selection, (range) => slices.insErase(range.range(), type, data));
  }

  public insMarker(type: SliceType, data?: unknown, selection?: Range<T>[] | IterableIterator<Range<T>>): Slice<T>[] {
    const {slices, txt} = this;
    const editor = txt.editor;
    selection ||= txt.editor.cursors();
    return forEachRange(selection, (range) => {
      editor.collapseCursor(range);
      const after = range.start.clone();
      after.refAfter();
      const marker = slices.insMarkerAfter(after.id, type, data);
      return marker;
    });
  }

  public del(sliceOrId: Slice<T> | ITimestampStruct): void {
    this.slices.del(sliceOrId instanceof Slice ? sliceOrId.id : sliceOrId);
  }
}
