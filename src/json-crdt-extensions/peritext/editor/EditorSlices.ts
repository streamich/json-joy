import {PersistedSlice} from '../slice/PersistedSlice';
import type {Peritext} from '../Peritext';
import type {SliceType} from '../slice/types';
import type {MarkerSlice} from '../slice/MarkerSlice';
import type {Slices} from '../slice/Slices';
import type {ITimestampStruct} from '../../../json-crdt-patch';
import type {Cursor} from './Cursor';

export class EditorSlices<T = string> {
  constructor(
    protected readonly txt: Peritext<T>,
    public readonly slices: Slices<T>,
  ) {}

  protected insAtCursors<S extends PersistedSlice<T>>(callback: (cursor: Cursor<T>) => S): S[] {
    const slices: S[] = [];
    this.txt.editor.forCursor((cursor) => {
      const slice = callback(cursor);
      slices.push(slice);
    });
    return slices;
  }

  public insStack(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T>[] {
    return this.insAtCursors((cursor) => this.slices.insStack(cursor.range(), type, data));
  }

  public insOverwrite(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T>[] {
    return this.insAtCursors((cursor) => this.slices.insOverwrite(cursor.range(), type, data));
  }

  public insErase(type: SliceType, data?: unknown | ITimestampStruct): PersistedSlice<T>[] {
    return this.insAtCursors((cursor) => this.slices.insErase(cursor.range(), type, data));
  }

  public insMarker(type: SliceType, data?: unknown, separator?: string): MarkerSlice<T>[] {
    return this.insAtCursors((cursor) => {
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
