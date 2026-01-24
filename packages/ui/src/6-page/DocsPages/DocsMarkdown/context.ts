import * as React from 'react';

export interface DocsMarkdownCtx {
  contentWidth?: number;
}

export const context = React.createContext({});
export const useDocsMarkdownCtx = () => React.useContext<DocsMarkdownCtx>(context);
