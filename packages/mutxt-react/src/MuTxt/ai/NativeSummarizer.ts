/**
 * Interface for the modern Chrome Summarizer API (window.Summarizer)
 */
export interface ISummarizer {
  /**
   * Summarizes the given input text.
   * @param text The input string to summarize.
   * @param options Optional context or hint for this specific summary.
   */
  summarize(text: string, options?: { context?: string }): Promise<string>;

  /**
   * Returns a stream of summary chunks as they are generated.
   */
  summarizeStreaming(text: string, options?: { context?: string }): ReadableStream<string>;

  /**
   * The maximum number of tokens allowed for input.
   */
  readonly inputQuota: number;

  /**
   * Measures how many tokens a specific text string would consume.
   */
  measureInputUsage(text: string): Promise<number>;

  /**
   * Releases the resources used by the summarizer instance.
   */
  destroy(): void;
}

/**
 * Interface for the static Summarizer factory on the window object.
 */
export interface SummarizerFactory {
  availability(): Promise<'no' | 'readily' | 'after-download'>;
  create(options?: SummarizerOptions): Promise<ISummarizer>;
  capabilities(): Promise<SummarizerCapabilities>;
}

export interface SummarizerOptions {
  type?: 'tl-dr' | 'key-points' | 'headline' | 'teaser';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

export interface SummarizerCapabilities {
  readonly available: 'no' | 'readily' | 'after-download';
  supportsType(type: string): 'no' | 'readily' | 'after-download';
}

// Extend the global Window object
declare global {
  interface Window {
    Summarizer: SummarizerFactory;
  }
}

const Summarizer = typeof window !== 'undefined' ? window.Summarizer : undefined;

export class NativeSummarizer {
  private static bullets: ISummarizer | undefined;

  static async getBulletSummary(text: string): Promise<string | undefined> {
    const summarizer = await this.getBulletsSummarizer();
    if (!summarizer) return;
    const safeText = await this.trunc(summarizer, text);
    if (!safeText) return;
    return await summarizer.summarize(safeText);
  }

  private static async getBulletsSummarizer() {
    if (!Summarizer) return;
    if (this.bullets) return this.bullets;
    const capabilities = await Summarizer.availability();
    if (capabilities === 'no') return;
    this.bullets = await Summarizer.create({
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
    });
    return this.bullets;
  }

  private static async trunc(summarizer: ISummarizer, text: string): Promise<string> {
    const quota = summarizer.inputQuota;
    let currentUsage = await summarizer.measureInputUsage(text);
    if (currentUsage <= quota) return text;
    let truncated = text.substring(0, quota * 4);
    currentUsage = await summarizer.measureInputUsage(truncated);
    while (currentUsage > quota && truncated.length > 0) {
      truncated = truncated.substring(0, Math.floor(truncated.length * 0.9));
      currentUsage = await summarizer.measureInputUsage(truncated);
    }
    return truncated;
  }
}
