export interface PeritextClipboard {
  /**
   * @param text The text to write to the clipboard.
   * @returns Returns `undefined` if text was written synchronously. If text
   *     was written using an async API returns a promise which resolves when
   *     the text has been written.
   */
  writeText(text: string): undefined | Promise<void>;

  /**
   * Writes data to the clipboard. Can contain multiple mime-types.
   * @param data The data to write to the clipboard. Can contain multiple
   *     mime-types.
   * @returns Returns `undefined` if data was written synchronously. If data
   *     was written using an async API returns a promise which resolves when
   *     the data has been written.
   */
  write(text: PeritextClipboardData<string>, binary?: PeritextClipboardData<Uint8Array>): undefined | Promise<void>;
}

export interface PeritextClipboardData<Value> {
  [mime: string]: Value;
};
