// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {CommonSliceType} from '../../../../json-crdt-extensions';
import {Blockquote} from './Blockquote';
import {Codeblock} from './Codeblock';
import type {BlockViewProps} from '../../../web/react/BlockView';

export interface RenderBlockProps extends BlockViewProps {
  children: React.ReactNode;
}

export const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const {block, children} = props;
  const tag = block.tag();
  switch (tag) {
    case '':
      return children;
    case CommonSliceType.codeblock: {
      return <Codeblock {...props} />;
    }
    case CommonSliceType.blockquote: {
      return <Blockquote {...props} />;
    }
    case CommonSliceType.h1: {
      return <h1>{children}</h1>;
    }
    case CommonSliceType.h2: {
      return <h2>{children}</h2>;
    }
    case CommonSliceType.h3: {
      return <h3>{children}</h3>;
    }
    case CommonSliceType.h4: {
      return <h4>{children}</h4>;
    }
    case CommonSliceType.h5: {
      return <h5>{children}</h5>;
    }
    case CommonSliceType.h6: {
      return <h6>{children}</h6>;
    }
    case CommonSliceType.title: {
      return <h1>{children}</h1>;
    }
    case CommonSliceType.subtitle: {
      return <h2>{children}</h2>;
    }
    default: {
      return <p style={{padding: '16px 0'}}>{children}</p>;
    }
  }
};
