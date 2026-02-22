import * as React from 'react';
import {rule} from 'nano-theme';
import slugify from 'slugify';
import type {Flat} from 'mdast-flat/lib/types';
import type {RenderNode} from '../../../../markdown/types';
import getText from '../../../../markdown/util/getText';

const blockClass = rule({
  cursor: 'n-resize',
});

interface Props {
  ast: Flat;
  idx: number;
  children: React.ReactNode;
}

const Heading: React.FC<Props> = ({children, ast, idx}) => {
  const node = ast.nodes[idx];
  const Component = ('h' + node.depth) as any;

  const [slug] = React.useState(() => {
    const text = getText(ast, idx, 1024);
    const slug = slugify(text);
    return slug;
  });

  const handleClick = () => {
    location.hash = '#' + slug;
  };

  return (
    <Component id={slug} className={blockClass} onClick={handleClick}>
      {children}
    </Component>
  );
};

const renderHeading: RenderNode = (renderers, ast, idx, props, state) => {
  return (
    <Heading ast={ast} idx={idx}>
      {renderers.children(renderers, ast, idx, props, state)}
    </Heading>
  );
};

export default renderHeading;
