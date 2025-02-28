export interface PeritextClipboard {
  /**
   * @param text The text to write to the clipboard.
   */
  writeText(text: string): Promise<void>;

  /**
   * Writes data to the clipboard. Can contain multiple mime-types.
   * @param data The data to write to the clipboard. Can contain multiple
   *     mime-types.
   */
  write(data: PeritextClipboardData): Promise<void>;
}

export interface PeritextClipboardData {
  [mime: string]: string | Blob | Promise<string | Blob>;
};
