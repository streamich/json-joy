import {drule} from 'nano-theme';
import * as React from 'react';
import slugify from 'slugify';
import type {Flat, TNode} from 'mdast-flat/lib/types';
import type {Renderers} from '../../../../../markdown/types';
import getText from '../../../../../markdown/util/getText';
import {useStyles} from '../../../../../styles/context';
import {MdastFlat} from '../../../../../markdown/MdastFlat';

const blockClass = drule({
  pad: '8px 0',
  fz: '0.93em',
  d: 'block',
});

export interface Props {
  node: TNode;
  ast: Flat;
  renderers?: Renderers;
}

const ContentItem: React.FC<Props> = ({node, ast, renderers}) => {
  const styles = useStyles();
  const cls = blockClass({
    '& a': {
      cursor: 's-resize',
      bdb: `1px solid ${styles.g(0.9)}`,
      '&:hover': {
        bdb: `1px solid ${styles.g(0.9)}`,
      },
    },
  });
  const [slug] = React.useState(() => {
    const text = getText(ast, node.idx, 1024);
    const slug = slugify(text);
    return slug;
  });

  const paddingLeft = Math.max(0, (node.depth ?? 0) - 2) * 16;

  return (
    <div className={cls} style={{paddingLeft}}>
      <a href={'#' + slug}>
        <MdastFlat inline inlineChildren ast={ast} renderers={renderers} nodeId={node.idx} />
      </a>
    </div>
  );
};

export default ContentItem;
