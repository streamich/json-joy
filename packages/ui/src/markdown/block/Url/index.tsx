import * as React from 'react';
import MarkdownBlock from '../../util/MarkdownBlock';
import Embed, {type ReactEmbedProps} from 'react-embed';
import {context} from '../../context';
import rootDepth from '../../util/rootDepth';
import MarkdownFullWidthBlock from '../../util/MarkdownFullWidthBlock';

const {useContext, useMemo, useEffect} = React;

const renderReactEmbedWrap: ReactEmbedProps['renderWrap'] = (children: React.ReactNode) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export interface UrlBlockProps {
  idx: number;
  url?: string;
  renderVoid: () => React.ReactElement<any>;
}

const UrlBlock: React.FC<UrlBlockProps> = ({idx, url = '', renderVoid}) => {
  const {ast, props, expandBlock} = useContext(context);
  const isExpandable = useMemo(() => (props.isExpandable ? props.isExpandable(url) : false), [props.isExpandable, url]);
  useEffect(() => {
    if (!isExpandable) return;
    const depth = rootDepth(ast, idx);
    if (depth > 3) return;
    expandBlock(idx, url);
  }, [idx, url, isExpandable]);

  const element = isExpandable ? (
    <MarkdownBlock idx={idx}>{props.LoadingBlock ? <props.LoadingBlock idx={idx} /> : <div />}</MarkdownBlock>
  ) : (
    <MarkdownBlock idx={idx}>
      <Embed url={url} renderWrap={renderReactEmbedWrap} renderVoid={renderVoid} />
    </MarkdownBlock>
  );

  return props.isFullWidth ? <MarkdownFullWidthBlock>{element}</MarkdownFullWidthBlock> : element;
};

export default UrlBlock;
