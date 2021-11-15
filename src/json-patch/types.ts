export * from './codec/json/types';
export * from './slate';

export type CreateRegexMatcher = (pattern: string, ignoreCase: boolean) => RegexMatcher;
export type RegexMatcher = (value: string) => boolean;

export interface JsonPatchOptions {
  /**
   * A function that create regular expression matcher. Should be provided
   * explicitly, to allow users supply safe regular expression implementation
   * to prevent ReDOS attacks.
   */
  createMatcher?: CreateRegexMatcher;
}

export interface ApplyPatchOptions extends JsonPatchOptions {
  /**
   * Whether mutation of the source document is allowed.
   */
  mutate: boolean;
}
