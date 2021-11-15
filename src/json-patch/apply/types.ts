export type CreateRegexMatcher = (pattern: string, ignoreCase: boolean) => RegexMatcher;
export type RegexMatcher = (value: string) => boolean;

export interface JsonPatchApplyOptions {
  /**
   * Whether mutating the original object is allowed.
   */
  mutate: boolean;

  /**
   * A function that create regular expression matcher. Should be provided
   * explicitly, to allow users supply safe regular expression implementation
   * to prevent ReDOS attacks.
   */
  createMatcher?: CreateRegexMatcher;
}
