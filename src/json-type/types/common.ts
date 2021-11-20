/**
 * Properties that are used to display to the user.
 */
export interface Display {
  /**
   * Title of something, i.e. a heading.
   */
  title?: string;

  /**
   * An introductory short description. Could be in Markdown.
   */
  intro?: string;

  /**
   * A long form description of something. Could be in Markdown.
   */
  description?: string;
}
