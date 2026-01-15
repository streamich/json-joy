export * from './codec/json/types';

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
