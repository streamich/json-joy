import * as rsync from '../../utils/rsync';

/**
 * State container for the {@link DropArea} component. Holds whether a
 * drag is currently hovering the area, and exposes a {@link pick} method
 * that consumers can call to programmatically open a native file picker.
 */
export class DropAreaState {
  /** Whether a file/item is currently being dragged over the area. */
  public readonly over = rsync.val(false);

  /** Hidden `<input type="file">` used by {@link pick}. */
  private inputEl: HTMLInputElement | null = null;

  constructor(
    /** Called when files are dropped or selected via the picker. */
    public onFiles?: (files: File[]) => void,
    /** Called when a URI is dropped. */
    public onUri?: (uri: string) => void,
    /** Called when text is dropped. */
    public onText?: (text: string) => void,
    /** Whether {@link pick} should allow selecting multiple files. */
    public multiple: boolean = true,
    /** `accept` attribute for the file picker. */
    public accept?: string,
  ) {}

  public readonly setInputEl = (el: HTMLInputElement | null): void => {
    this.inputEl = el;
  };

  /** Programmatically open the native file picker. */
  public readonly pick = (): void => {
    this.inputEl?.click();
  };
}
