export interface PeritextClipboard {
  /**
   * @param text The text to write to the clipboard.
   */
  writeText(text: string): Promise<void>;

  /**
   * Writes data to the clipboard. Can contain multiple mime-types.
   * @param items The data to write to the clipboard. Can contain multiple
   *     mime-types.
   */
  write(list: PeritextClipboardItem[]): Promise<void>;
}

export type PeritextClipboardItem = [
  mime: string,
  value: string | Blob | Promise<string | Blob>,
];
