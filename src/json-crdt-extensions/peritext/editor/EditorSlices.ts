import {PersistedSlice} from '../slice/PersistedSlice';
import type {Peritext} from '../Peritext';
import type {SliceType} from '../slice/types';
import type {MarkerSlice} from '../slice/MarkerSlice';
import type {Slices} from '../slice/Slices';
import type {ITimestampStruct} from '../../../json-crdt-patch';
import type {Range} from '../rga/Range';

export class EditorSlices<T = string> {
  constructor(
    protected readonly txt: Peritext<T>,
    public readonly slices: Slices<T>,
  ) {}

  protected insAtCursors<S extends PersistedSlice<T>>(selection: Range<T>[] | IterableIterator<Range<T>>, callback: (range: Range<T>) => S): S[] {
    const slices: S[] = [];
    for (const cursor of selection) {
      const slice = callback(cursor);
      slices.push(slice);
    }
    return slices;
  }

  public insStack(type: SliceType, data?: unknown | ITimestampStruct, selection: Range<T>[] | IterableIterator<Range<T>> = this.txt.editor.cursors()): PersistedSlice<T>[] {
    return this.insAtCursors(selection, (cursor) => this.slices.insStack(cursor.range(), type, data));
  }

  public insOne(type: SliceType, data?: unknown | ITimestampStruct, selection: Range<T>[] | IterableIterator<Range<T>> = this.txt.editor.cursors()): PersistedSlice<T>[] {
    return this.insAtCursors(selection, (cursor) => this.slices.insOne(cursor.range(), type, data));
  }

  public insErase(type: SliceType, data?: unknown | ITimestampStruct, selection: Range<T>[] | IterableIterator<Range<T>> = this.txt.editor.cursors()): PersistedSlice<T>[] {
    return this.insAtCursors(selection, (cursor) => this.slices.insErase(cursor.range(), type, data));
  }

  public insMarker(type: SliceType, data?: unknown, separator?: string, selection: Range<T>[] | IterableIterator<Range<T>> = this.txt.editor.cursors()): MarkerSlice<T>[] {
    return this.insAtCursors(selection, (cursor) => {
      this.txt.editor.collapseCursor(cursor);
      const after = cursor.start.clone();
      after.refAfter();
      const marker = this.slices.insMarkerAfter(after.id, type, data, separator);
      return marker;
    });
  }

  public del(sliceOrId: PersistedSlice<T> | ITimestampStruct): void {
    this.slices.del(sliceOrId instanceof PersistedSlice ? sliceOrId.id : sliceOrId);
  }
}
