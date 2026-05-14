import {rsync} from '@jsonjoy.com/ui';
import {type Range, Transforms, type Path} from 'slate';
import {insertMathInline, removeMathInlineAtPath} from '../behavior/math';
import type {MathInlineElement, MathSize, MathThing} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';

/**
 * State for the inline-math editing popup.
 */
export class InlineMathState {
  public readonly open = rsync.val(false);
  public readonly point = rsync.val<AnchorPoint | undefined>(undefined);

  /** When non-null, we are editing an existing inline math node. */
  public readonly editingPath = rsync.val<Path | null>(null);
  public readonly editingThingId = rsync.val<string | null>(null);

  public readonly draftVal = rsync.val('');
  public readonly draftSize = rsync.val<MathSize>('M');
  public readonly draftLabel = rsync.val('');

  /** Snapshot of the editor selection at open time. */
  public readonly rangeSnapshot = rsync.val<Range | null>(null);

  constructor(public readonly mutxt: MuTxtState) {}

  private capturePoint(): AnchorPoint | undefined {
    const shellBox = this.mutxt.shellBox.value;
    if (!shellBox) return undefined;
    const [x, y, width] = shellBox;
    return {x: x + width / 2, y, dx: 0, dy: 1};
  }

  public readonly openInsert = (): boolean => {
    if (this.mutxt.readOnly.value) return false;
    const point = this.capturePoint();
    if (!point) return false;
    this.rangeSnapshot.set(this.mutxt.editor.selection ?? null);
    this.editingPath.set(null);
    this.editingThingId.set(null);
    this.draftVal.set('');
    this.draftSize.set('M');
    this.draftLabel.set('');
    this.point.set(point);
    this.open.set(true);
    return true;
  };

  public readonly openEdit = (element: MathInlineElement, path: Path): boolean => {
    if (this.mutxt.readOnly.value) return false;
    const point = this.capturePoint();
    if (!point) return false;
    const id = element['@thing'];
    const thing = id ? (this.mutxt.things.get(id) as MathThing | undefined) : undefined;
    this.rangeSnapshot.set(null);
    this.editingPath.set(path);
    this.editingThingId.set(id ?? null);
    this.draftVal.set(thing?.val ?? '');
    this.draftSize.set(thing?.size === 'S' ? 'S' : 'M');
    this.draftLabel.set(thing?.label ?? '');
    this.point.set(point);
    this.open.set(true);
    return true;
  };

  public readonly setDraftVal = (value: string): void => {
    this.draftVal.set(value);
    this.persistIfEditing();
  };

  public readonly setDraftSize = (value: MathSize): void => {
    this.draftSize.set(value === 'S' ? 'S' : 'M');
    this.persistIfEditing();
  };

  public readonly setDraftLabel = (value: string): void => {
    this.draftLabel.set(value);
    this.persistIfEditing();
  };

  private readonly persistIfEditing = (): void => {
    const id = this.editingThingId.value;
    if (!id) return;
    const val = this.draftVal.value.trim();
    if (!val) return;
    const size = this.draftSize.value === 'S' ? 'S' : 'M';
    const label = this.draftLabel.value.trim();
    this.mutxt.things.update(id, {
      val,
      size: size === 'M' ? undefined : 'S',
      label: label || undefined,
    });
    this.mutxt.sync(false);
  };

  public readonly close = (): void => {
    if (!this.open.value) return;
    this.open.set(false);
    this.point.set(undefined);
    this.editingPath.set(null);
    this.editingThingId.set(null);
    this.rangeSnapshot.set(null);
    this.mutxt.api.focus();
  };

  public readonly apply = (): void => {
    const editingId = this.editingThingId.value;
    if (editingId) {
      this.close();
      return;
    }
    const val = this.draftVal.value.trim();
    if (!val) return;
    const size = this.draftSize.value === 'S' ? 'S' : 'M';
    const label = this.draftLabel.value.trim();
    const snapshot = this.rangeSnapshot.value;
    if (snapshot) {
      try {
        Transforms.select(this.mutxt.editor, snapshot);
      } catch {}
    }
    const id = this.mutxt.things.add({
      '@type': 'math',
      val,
      ...(size === 'M' ? {} : {size: 'S' as MathSize}),
      ...(label ? {label} : {}),
    });
    insertMathInline(this.mutxt.editor, id);
    this.mutxt.sync(false);
    this.close();
  };

  public readonly remove = (): void => {
    const path = this.editingPath.value;
    if (!path) return;
    if (!removeMathInlineAtPath(this.mutxt.editor, path)) return;
    this.mutxt.sync(false);
    this.close();
  };
}
