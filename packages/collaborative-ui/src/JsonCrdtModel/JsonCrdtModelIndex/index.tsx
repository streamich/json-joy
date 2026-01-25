import * as React from 'react';
import type {Model} from 'json-joy/lib/json-crdt';
import {NodeItem} from './NodeItem';
import {rule} from 'nano-theme';
import {useModelTick} from '../../hooks/useModelTick';

const css = {
  block: rule({
    w: '100%',
    bxz: 'border-box',
  }),
};

export interface JsonCrdtModelIndexProps {
  model: Model<any>;
  readonly?: boolean;
}

export const JsonCrdtModelIndex: React.FC<JsonCrdtModelIndexProps> = ({model, readonly}) => {
  useModelTick(model);

  const list: React.ReactNode[] = [];

  // biome-ignore lint: .forEach is the way to iterate here
  model.index.forEach(({v: node}) => {
    list.push(<NodeItem key={node.id.sid + '.' + node.id.time} model={model} node={node} readonly={readonly} />);
  });

  return <div className={css.block}>{list}</div>;
};
