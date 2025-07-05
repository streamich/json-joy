import {Anchor} from '../rga/constants';
import {PersistedSlice} from './PersistedSlice';
import type {Range} from '../rga/Range';

/**
 * Represents a block split in the text, i.e. it is a *marker* that shows
 * where a block was split. Markers also insert one "\n" new line character.
 * Both marker ends are attached to the "before" anchor fo the "\n" new line
 * character, i.e. it is *collapsed* to the "before" anchor.
 */
export class MarkerSlice<T = string> extends PersistedSlice<T> {
  /**
   * Returns the {@link Range} which exactly contains the block boundary of this
   * marker.
   */
  public boundary(): Range<T> {
    const start = this.start;
    const end = start.clone();
    end.anchor = Anchor.After;
    return this.txt.range(start, end);
  }

  public del(): void {
    super.del();
    const txt = this.txt;
    const range = txt.range(
      this.start,
      this.start.copy((p) => (p.anchor = Anchor.After)),
    );
    txt.delStr(range);
  }
}
