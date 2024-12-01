/**
 * Represents a node in the JsonML tree. Can be a string or an element.
 */
export type JsonMlNode = string | JsonMlElement;

/**
 * Represents an element in the JsonML tree. Lke an HTML element.
 */
export type JsonMlElement = [
  /**
   * Tag name of the element. An empty string `''` tag represents a *fragment* -
   * a list of nodes. Similar to a `DocumentFragment` in the DOM, or
   * `React.Fragment` `<>` in React.
   *
   * When converting to HTML, an empty string tag is not rendered and numeric
   * tags are converted to strings.
   */
  tag: '' | string | number,
  /**
   * Attributes of the element. `null` if there are no attributes. Attribute
   * object values are converted to strings when formatting to HTML.
   */
  attrs: null | Record<string, unknown>,
  /**
   * Child nodes of the element. Can be a mix of strings and elements.
   */
  ...children: JsonMlNode[],
];
