import * as React from 'react';

export interface StyleContextValue {
  /**
   * If true, the JSON is not editable. Useful for displaying JSON.
   *
   * @default false
   */
  readonly?: boolean;

  /**
   * Print the JSON in a more formal way. Adds quotes to keys and string values.
   * Adds commas after each property.
   *
   * Works only in readonly mode.
   *
   * @default false
   */
  formal?: boolean;

  /**
   * Keep the order of properties in objects. By default the properties are
   * sorted alphabetically.
   *
   * @default false
   */
  keepOrder?: boolean;

  /**
   * Font size of the JSON.
   *
   * @default 13.4px
   */
  fontSize?: string;

  /**
   * If true, the JSON is printed in a compact way. Reduces spacing between
   * elements.
   *
   * @default false
   */
  compact?: boolean;

  /**
   * If true, the JSON starts collapsed, but can be expanded by clicking on it.
   *
   * @default false
   */
  collapsed?: boolean;

  /**
   * Whether to show +/- buttons to expand/collapse objects and arrays.
   *
   * @default false
   */
  noCollapseToggles?: boolean;
}

export const context = React.createContext<StyleContextValue>({});

export const useStyles = () => React.useContext(context);
