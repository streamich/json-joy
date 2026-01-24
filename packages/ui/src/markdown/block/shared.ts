export interface IMarkdownBlockProps {
  onError?: (error: Error | unknown) => void;
  renderLoading?: (props: IMarkdownBlockProps) => React.ReactNode;
  renderError: (props: IMarkdownBlockProps, error?: Error) => React.ReactNode;
}

export interface IMarkdownBlockCodeProps extends IMarkdownBlockProps {
  idx: number;
  source: string;
}

const renderNothing = () => null;

export const blockDefaultProps = {
  /* tslint:disable */
  onError: console.log,
  /* tslint:enable */
  renderLoading: renderNothing,
  renderError: renderNothing,
};
