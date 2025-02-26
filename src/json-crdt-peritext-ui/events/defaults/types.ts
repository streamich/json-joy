export interface PeritextClipboardApi {
  /**
   * @param text The text to write to the clipboard.
   */
  writeText(text: string): Promise<void>;
}
