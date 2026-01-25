import * as React from 'react';
import {JsonCrdtDemoModel} from './JsonCrdtDemoModel';
import {Card, CardHeader} from '../Card';
import {useT} from 'use-t';
import {IdLabel} from '../atoms/IdLabel';
import type {Block} from './state/Block';

export interface JsonCrdtBlockProps {
  block: Block;
}

export const JsonCrdtBlock: React.FC<JsonCrdtBlockProps> = ({block}) => {
  const [t] = useT();

  return (
    <Card header={<CardHeader title={t('Block')} left={<IdLabel>{block.id}</IdLabel>} />}>
      <JsonCrdtDemoModel model={block.session.model} />
    </Card>
  );
};
